import os
import uuid
import datetime
from flask import Flask, request, jsonify, send_file, redirect, session
from flask_cors import CORS
from celery import Celery
from extract_text import extract_text
from text_to_speech import text_to_speech
from dotenv import load_dotenv
from models import db, User
from google_auth_oauthlib.flow import Flow
from google.oauth2 import id_token
from google.auth.transport.requests import Request

load_dotenv()

app = Flask(__name__)

# config
app.secret_key = os.getenv("SECRET_KEY")
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///users.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["UPLOAD_FOLDER"] = "./uploads"
app.config["EXTRACTED_FOLDER"] = "./extracted"
app.config["CONVERTED_FOLDER"] = "./converted"
app.config["MAX_CONTENT_LENGTH"] = 20 * 1024 * 1024  # 20 MB limit

# Frontend and Celery configurations
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
BROKER_URL = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0")
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
REDIRECT_URI = os.getenv("REDIRECT_URI", "http://localhost:5000/oauth2callback")

CORS(
    app,
    resources={r"/*": {"origins": [FRONTEND_URL]}},
    methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
    expose_headers=["Content-Disposition"],
)

# folders
os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)
os.makedirs(app.config["EXTRACTED_FOLDER"], exist_ok=True)
os.makedirs(app.config["CONVERTED_FOLDER"], exist_ok=True)

celery = Celery(app.name, broker=BROKER_URL)
celery.conf.update(app.config)

db.init_app(app)


@celery.task(bind=True)
def process_file(self, filename):
    """
    Celery task to process a file by extracting text and converting it to speech.

    Args:
        filename (str): Name of the uploaded file.

    Returns:
        dict: Paths to the processed text, audio, and subtitle files.
    """
    try:
        # Stage 1: Extract text
        self.update_state(state="EXTRACTING_TEXT")
        input_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        text_file = extract_text(input_path, app.config["EXTRACTED_FOLDER"])

        # Stage 2: Convert text to speech
        self.update_state(state="GENERATING_AUDIO")
        audio_path, subtitle_path = text_to_speech(
            text_file, app.config["CONVERTED_FOLDER"]
        )

        # Success
        return {
            "status": "COMPLETED",
            "text_file": text_file,
            "audio_file": audio_path,
            "subtitle_file": subtitle_path,
        }

    except Exception as e:
        self.update_state(state="FAILED", meta={"error": str(e)})
        raise e


@app.after_request
def add_security_headers(response):
    response.headers["Access-Control-Allow-Origin"] = FRONTEND_URL
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    response.headers["Access-Control-Expose-Headers"] = "Content-Disposition"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; script-src 'self'; style-src 'self'"
    )
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response


@app.route("/upload", methods=["POST", "OPTIONS"])
def upload_file():
    if request.method == "OPTIONS":
        # Handle preflight request
        response = jsonify({"message": "CORS preflight request successful"})
        response.status_code = 204
        return response
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    # unique filename
    unique_filename = f"{uuid.uuid4()}_{file.filename}"
    filepath = os.path.join(app.config["UPLOAD_FOLDER"], unique_filename)
    file.save(filepath)

    # queue
    task = process_file.delay(unique_filename)

    return jsonify({"message": "File uploaded", "task_id": task.id}), 202


@app.route("/status/<task_id>", methods=["GET"])
def unified_status(task_id):
    """
    Unified endpoint to check the status of the file processing pipeline.

    Args:
        task_id (str): Celery task ID.

    Returns:
        Response: JSON containing the status and results (if completed).
    """
    task = process_file.AsyncResult(task_id)

    if task.state == "PENDING":
        return jsonify({"status": "PENDING"}), 202
    elif task.state == "STARTED":
        return jsonify({"status": "STARTED"}), 202
    elif task.state == "EXTRACTING_TEXT":
        return jsonify({"status": "EXTRACTING_TEXT"}), 202
    elif task.state == "GENERATING_AUDIO":
        return jsonify({"status": "GENERATING_AUDIO"}), 202
    elif task.state == "SUCCESS":
        result = task.result
        return (
            jsonify(
                {
                    "status": "COMPLETED",
                    "files": {
                        "text_file": os.path.basename(result["text_file"]),
                        "audio_file": os.path.basename(result["audio_file"]),
                        "subtitle_file": os.path.basename(result["subtitle_file"]),
                    },
                }
            ),
            200,
        )
    elif task.state == "FAILED":
        return (
            jsonify(
                {"status": "FAILED", "error": task.info.get("error", "Unknown error")}
            ),
            500,
        )
    else:
        return jsonify({"status": "UNKNOWN"}), 500


@app.route("/file/<filename>", methods=["GET"])
def serve_file(filename):
    """
    Serve a file securely based on its filename.

    Args:
        filename (str): Name of the file requested.

    Returns:
        Response: The requested file, or an error if not found.
    """
    extracted_folder = app.config["EXTRACTED_FOLDER"]
    converted_folder = app.config["CONVERTED_FOLDER"]

    if filename.endswith(".txt"):
        file_path = os.path.join(extracted_folder, filename)
    else:
        file_path = os.path.join(converted_folder, filename)

    if os.path.exists(file_path) and os.path.isfile(file_path):
        return send_file(file_path, as_attachment=True)
    else:
        return jsonify({"error": "File not found or unauthorized access"}), 404


@app.route("/google-login", methods=["GET"])
def google_login():
    flow = Flow.from_client_config(
        {
            "web": {
                "client_id": GOOGLE_CLIENT_ID,
                "client_secret": GOOGLE_CLIENT_SECRET,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "redirect_uris": [REDIRECT_URI],
            }
        },
        scopes=[
            "openid",
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/userinfo.profile",
        ],
    )
    flow.redirect_uri = REDIRECT_URI
    authorization_url, state = flow.authorization_url()
    session["state"] = state
    return redirect(authorization_url)


@app.route("/oauth2callback", methods=["GET"])
def oauth2callback():
    flow = Flow.from_client_config(
        {
            "web": {
                "client_id": GOOGLE_CLIENT_ID,
                "client_secret": GOOGLE_CLIENT_SECRET,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "redirect_uris": [REDIRECT_URI],
            }
        },
        scopes=[
            "openid",
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/userinfo.profile",
        ],
    )
    flow.redirect_uri = REDIRECT_URI
    flow.fetch_token(authorization_response=request.url)

    credentials = flow.credentials
    idinfo = id_token.verify_oauth2_token(
        credentials.id_token, Request(), GOOGLE_CLIENT_ID
    )

    user = User.query.filter_by(google_id=idinfo["sub"]).first()
    if not user:
        user = User(
            google_id=idinfo["sub"],
            name=idinfo["name"],
            email=idinfo["email"],
            token=credentials.token,
            last_login=datetime.datetime.now(datetime.timezone.utc),
        )
        db.session.add(user)
    else:
        user.token = credentials.token
        user.last_login = datetime.datetime.now(datetime.timezone.utc)
    db.session.commit()

    return jsonify(
        {
            "message": "Login successful",
            "user": {
                "name": user.name,
                "email": user.email,
                "last_login": user.last_login,
            },
        }
    )


if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True, host="0.0.0.0", port=5000)
