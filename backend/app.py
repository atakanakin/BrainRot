import os
import uuid
from flask import Flask, request, jsonify
from flask_cors import CORS
from celery import Celery

app = Flask(__name__)
CORS(app)

# config
app.config['UPLOAD_FOLDER'] = './uploads'
app.config['MAX_CONTENT_LENGTH'] = 20 * 1024 * 1024  # 20 MB limit

# upload folder
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Celery
app.config['CELERY_BROKER_URL'] = 'redis://localhost:6379/0'
app.config['CELERY_RESULT_BACKEND'] = 'redis://localhost:6379/0'

celery = Celery(app.name, broker=app.config['CELERY_BROKER_URL'])
celery.conf.update(app.config)

@celery.task
def process_file(filename):
    # simulate
    import time # TODO: remove
    print(f"Processing {filename}...")
    time.sleep(10)
    return f"Processed {filename}"

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
def task_status(task_id):
    task = process_file.AsyncResult(task_id)
    if task.state == 'PENDING':
        return jsonify({"status": "Pending"}), 202
    elif task.state == 'SUCCESS':
        return jsonify({"status": "Completed", "result": task.result}), 200
    else:
        return jsonify({"status": "Processing"}), 202

if __name__ == '__main__':
    app.run(debug=True)
