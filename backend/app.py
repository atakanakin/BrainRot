import os
import uuid
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from celery import Celery
from extract_text import extract_text
from text_to_speech import text_to_speech

app = Flask(__name__)

FRONTEND_URL = "http://localhost:3000"

CORS(
    app,
    resources={
        r"/*": {"origins": [FRONTEND_URL]}
    },
    methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
    expose_headers=["Content-Disposition"],
)

# config
app.config['UPLOAD_FOLDER'] = './uploads'
app.config['EXTRACTED_FOLDER'] = './extracted'
app.config['CONVERTED_FOLDER'] = './converted'
app.config['MAX_CONTENT_LENGTH'] = 20 * 1024 * 1024  # 20 MB limit

# upload folder
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['EXTRACTED_FOLDER'], exist_ok=True)
os.makedirs(app.config['CONVERTED_FOLDER'], exist_ok=True)

# Celery
app.config['CELERY_BROKER_URL'] = 'redis://localhost:6379/0'
app.config['CELERY_RESULT_BACKEND'] = 'redis://localhost:6379/0'

celery = Celery(app.name, broker=app.config['CELERY_BROKER_URL'])
celery.conf.update(app.config)

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
        input_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        text_file = extract_text(input_path, app.config['EXTRACTED_FOLDER'])

        # Stage 2: Convert text to speech
        self.update_state(state="GENERATING_AUDIO")
        audio_path, subtitle_path = text_to_speech(text_file, app.config['CONVERTED_FOLDER'])

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
    # CORS Headers
    response.headers["Access-Control-Allow-Origin"] = FRONTEND_URL
    response.headers["Access-Control-Allow-Credentials"] = "false"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    response.headers["Access-Control-Expose-Headers"] = "Content-Disposition"
    
    # Security Headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self'; style-src 'self'"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

    return response

@app.route('/upload', methods=['POST', 'OPTIONS'])
def upload_file():
    if request.method == 'OPTIONS':
        # Handle preflight request
        response = jsonify({"message": "CORS preflight request successful"})
        response.status_code = 204
        return response
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    # unique filename
    unique_filename = f"{uuid.uuid4()}_{file.filename}"
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
    file.save(filepath)

    # queue
    task = process_file.delay(unique_filename)

    return jsonify({"message": "File uploaded", "task_id": task.id}), 202


@app.route('/status/<task_id>', methods=['GET'])
def unified_status(task_id):
    """
    Unified endpoint to check the status of the file processing pipeline.

    Args:
        task_id (str): Celery task ID.

    Returns:
        Response: JSON containing the status and results (if completed).
    """
    task = process_file.AsyncResult(task_id)

    if task.state == 'PENDING':
        return jsonify({"status": "PENDING"}), 202
    elif task.state == 'STARTED':
        return jsonify({"status": "STARTED"}), 202
    elif task.state == 'EXTRACTING_TEXT':
        return jsonify({"status": "EXTRACTING_TEXT"}), 202
    elif task.state == 'GENERATING_AUDIO':
        return jsonify({"status": "GENERATING_AUDIO"}), 202
    elif task.state == 'SUCCESS':
        result = task.result
        return jsonify({
            "status": "COMPLETED",
            "files": {
                "text_file": os.path.basename(result["text_file"]),
                "audio_file": os.path.basename(result["audio_file"]),
                "subtitle_file": os.path.basename(result["subtitle_file"]),
            },
        }), 200
    elif task.state == 'FAILED':
        return jsonify({"status": "FAILED", "error": task.info.get("error", "Unknown error")}), 500
    else:
        return jsonify({"status": "UNKNOWN"}), 500
    
@app.route('/file/<filename>', methods=['GET'])
def serve_file(filename):
    """
    Serve a file securely based on its filename.

    Args:
        filename (str): Name of the file requested.

    Returns:
        Response: The requested file, or an error if not found.
    """
    extracted_folder = app.config['EXTRACTED_FOLDER']
    converted_folder = app.config['CONVERTED_FOLDER']

    if filename.endswith(".txt"):
        file_path = os.path.join(extracted_folder, filename)
    else:
        file_path = os.path.join(converted_folder, filename)
    
    if os.path.exists(file_path) and os.path.isfile(file_path):
        return send_file(file_path, as_attachment=True)
    else:
        return jsonify({"error": "File not found or unauthorized access"}), 404

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
