from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import os
from PIL import Image
import logging
from flask_cors import CORS
from utils import success_response, error_response

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


@app.route('/upload', methods=['OPTIONS'])
def upload_options():
    response = app.make_default_options_response()
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173'
    response.headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    return response


@app.route('/upload', methods=['POST'])
def upload_file():
    try:
        if 'file' not in request.files or request.files['file'].filename == '':
            return error_response('No file selected or invalid file in request', 400)

        file = request.files['file']

        if not allowed_file(file.filename):
            return error_response('Invalid file type. Allowed types: PNG, JPG, JPEG', 400)

        filename = secure_filename(file.filename)
        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)

        original_size = get_file_size(file_path)
        processing_result = process_image(file_path)

        if not processing_result['success']:
            return error_response('Error processing image', 500, processing_result['error'])

        return success_response({
            'original_size': original_size,
            'filename': filename,
            'mock_upscale_factor': processing_result['mock_upscale_factor']
        })

    except Exception as e:
        return error_response('Error processing upload', 500, str(e))

if __name__ == '__main__':
    app.run(debug=True, port=5000)