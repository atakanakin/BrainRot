import os, jwt
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
from datetime import timedelta, datetime
from functools import wraps

load_dotenv()

app = Flask(__name__)

# config
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)
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
    
def create_tokens(user_id):
    """Create access and refresh tokens"""
    access_token = jwt.encode({
        'user_id': user_id,
        'exp': datetime.utcnow() + app.config['JWT_ACCESS_TOKEN_EXPIRES']
    }, app.config['JWT_SECRET_KEY'])
    
    refresh_token = jwt.encode({
        'user_id': user_id,
        'exp': datetime.utcnow() + app.config['JWT_REFRESH_TOKEN_EXPIRES']
    }, app.config['JWT_SECRET_KEY'])
    
    return access_token, refresh_token

def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'No token provided'}), 401
        try:
            token = token.split(' ')[1]
            payload = jwt.decode(token, app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
            request.user_id = payload['user_id']
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
        return f(*args, **kwargs)
    return decorated


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


@app.route("/google-login")
def google_login():
    try:
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
            scopes=["openid", "https://www.googleapis.com/auth/userinfo.email", 
                   "https://www.googleapis.com/auth/userinfo.profile"]
        )
        flow.redirect_uri = REDIRECT_URI
        authorization_url, state = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true',
            prompt='consent'
        )
        session["state"] = state
        return redirect(authorization_url)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/oauth2callback")
def oauth2callback():
    try:
        if request.args.get('state') != session.get('state'):
            return jsonify({"error": "Invalid state parameter"}), 401

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
            scopes=["openid", "https://www.googleapis.com/auth/userinfo.email", 
                   "https://www.googleapis.com/auth/userinfo.profile"]
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
                token=credentials.token
            )
            db.session.add(user)
        else:
            user.update_token(credentials.token)
            user.update_last_login()

        db.session.commit()
        
        access_token, refresh_token = create_tokens(user.id)
        
        return jsonify({
            "message": "Login successful",
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "is_premium": user.is_premium,
                "remaining_tokens": user.remaining_create_tokens,
                "last_login": user.last_login.isoformat()
            }
        })

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    
@app.route("/refresh-token", methods=["POST"])
def refresh_token():
    try:
        refresh_token = request.json.get('refresh_token')
        if not refresh_token:
            return jsonify({"error": "No refresh token provided"}), 401

        payload = jwt.decode(refresh_token, app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
        user = User.query.get(payload['user_id'])
        
        if not user:
            return jsonify({"error": "User not found"}), 404

        access_token, new_refresh_token = create_tokens(user.id)
        
        return jsonify({
            "access_token": access_token,
            "refresh_token": new_refresh_token
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 401
    
@app.route("/user/status")
@login_required
def get_user_status():
    try:
        user = User.query.get(request.user_id)
        return jsonify({
            "is_premium": user.is_premium,
            "remaining_tokens": user.remaining_create_tokens,
            "name": user.name,
            "email": user.email
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/logout", methods=["POST"])
@login_required
def logout():
    try:
        user = User.query.get(request.user_id)
        user.update_last_login()
        return jsonify({"message": "Logged out successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True, host="0.0.0.0", port=5000)
