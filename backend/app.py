import os
import uuid
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from celery import Celery
from extract_text import extract_text
from text_to_speech import text_to_speech

app = Flask(__name__)
CORS(app)

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

@app.route('/upload', methods=['POST'])
def upload_file():
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
        return jsonify({
            "status": "COMPLETED",
            "text_file": task.result["text_file"],
            "audio_file": task.result["audio_file"],
            "subtitle_file": task.result["subtitle_file"],
        }), 200
    elif task.state == 'FAILED':
        return jsonify({"status": "FAILED", "error": task.info.get("error", "Unknown error")}), 500
    else:
        return jsonify({"status": "UNKNOWN"}), 500

if __name__ == '__main__':
    app.run(debug=True)
