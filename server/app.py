from flask import Flask, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename
import os
from PIL import Image
import logging
from flask_cors import CORS
from utils import success_response, error_response
import uuid


app = Flask(__name__)

CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:5173"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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


@app.route('/upload', methods=['OPTIONS'])
def upload_options():
    response = app.make_default_options_response()
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173'
    response.headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    return response


@app.route('/upload', methods=['POST'])
def upload_image():
    try:
        file = request.files['file']
        if file:
            img = Image.open(file)
            upscale_factor = 2
            img_resized = img.resize((img.width * upscale_factor, img.height * upscale_factor))
            filename = secure_filename(file.filename)
            img_resized.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            return jsonify({'status': 'success', 'url': f'/uploads/{filename}'})
    except Exception as e:
        print(f"Error processing upload: {e}")
        return jsonify({'status': 'error', 'message': str(e)})

#Upscaling logic (replace with an actual implementation later)
def process_image(file_path):
    with Image.open(file_path) as img:
        mock_upscale_factor = 2.0
        original_width, original_height = img.size
        new_width = int(original_width * mock_upscale_factor)
        new_height = int(original_height * mock_upscale_factor)
        
        upscaled_img = img.resize((new_width, new_height), Image.LANCZOS)

        new_filename = f"transformed_{uuid.uuid4().hex}.png"
        upscaled_img_path = os.path.join(app.config['UPLOAD_FOLDER'], new_filename)
        upscaled_img.save(upscaled_img_path)

        print(f"Original size: {original_width}x{original_height}")
        print(f"Transformed size: {new_width}x{new_height}")

        return {
            'success': True,
            'upscaled_image_path': upscaled_img_path,
            'new_filename': new_filename,
            'mock_upscale_factor': mock_upscale_factor
        }
        
@app.route('/upscale', methods=['POST'])
def upscale_image():
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

        #apply upscaling
        processing_result = process_image(file_path)

        if not processing_result['success']:
            return error_response('Error processing image', 500, processing_result['error'])

        upscaled_image_url = f"http://localhost:5100/uploads/{processing_result['new_filename']}"

        if not processing_result['success']:
            return error_response('Error processing image', 500, processing_result['error'])

        return jsonify({
            'status': 'success',
            'message': 'Image upscaled successfully',
            'url': upscaled_image_url,
            'mock_upscale_factor': 2.0
        })

    except Exception as e:
        logger.error(f"Error in /upscale route: {str(e)}")
        return jsonify({
            'status': 'error', 
            'message': 'Error processing upscale',
            'details': str(e)
        }), 500
        
        
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
    
if __name__ == '__main__':
    app.run(debug=True, port=5100)