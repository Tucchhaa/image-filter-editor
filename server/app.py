# app.py
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import os
from PIL import Image
import logging
from flask_cors import CORS

app = Flask(__name__)

# Simplified CORS setup
CORS(app, origins=['http://localhost:5173'])

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
MAX_CONTENT_LENGTH = 16 * 1024 * 1024

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        'status': 'success',
        'message': 'Server is running'
    })

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_file_size(file_path):
    return os.path.getsize(file_path)

def process_image(file_path):
    try:
        with Image.open(file_path) as img:
            mock_upscale_factor = 2.0
            return {
                'success': True,
                'mock_upscale_factor': mock_upscale_factor
            }
    except Exception as e:
        logger.error(f"Error processing image: {str(e)}")
        return {
            'success': False,
            'error': str(e)
        }

@app.route('/upload', methods=['POST', 'OPTIONS'])
def upload_file():
    # Handle preflight request
    if request.method == 'OPTIONS':
        response = app.make_default_options_response()
        response.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173'
        response.headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
        return response

    if request.method == 'POST':
        if 'file' not in request.files:
            response = jsonify({
                'status': 'error',
                'message': 'No file part in the request'
            })
            response.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173'
            return response, 400

        file = request.files['file']
        if file.filename == '':
            response = jsonify({
                'status': 'error',
                'message': 'No file selected'
            })
            response.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173'
            return response, 400

        if not allowed_file(file.filename):
            response = jsonify({
                'status': 'error',
                'message': 'Invalid file type. Allowed types: PNG, JPG, JPEG'
            })
            response.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173'
            return response, 400

        try:
            filename = secure_filename(file.filename)
            os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(file_path)

            original_size = get_file_size(file_path)
            processing_result = process_image(file_path)

            if not processing_result['success']:
                response = jsonify({
                    'status': 'error',
                    'message': 'Error processing image',
                    'details': processing_result['error']
                })
                response.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173'
                return response, 500

            response = jsonify({
                'status': 'success',
                'message': 'File uploaded and processed successfully',
                'details': {
                    'original_size': original_size,
                    'filename': filename,
                    'mock_upscale_factor': processing_result['mock_upscale_factor']
                }
            })
            response.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173'
            return response

        except Exception as e:
            response = jsonify({
                'status': 'error',
                'message': 'Error processing upload',
                'details': str(e)
            })
            response.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173'
            return response, 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)