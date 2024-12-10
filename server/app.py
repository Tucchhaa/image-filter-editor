import base64

from flask import Flask, request, jsonify
import os
import io
from PIL import Image
import logging
from flask_cors import CORS

from super_resolution.execute import upscale_gan , upscale_srresnet
from super_resolution.utils import error_response


app = Flask(__name__)

CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:5173", "http://127.0.0.1:5173"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
MAX_CONTENT_LENGTH = 16 * 1024 * 1024

FORMAT_MAP = {
    'jpg': ('JPEG', 'image/jpeg'),
    'jpeg': ('JPEG', 'image/jpeg'),
    'png': ('PNG', 'image/png')
}

UPSCALING_METHODS = {
    'gan': upscale_gan,
    'resnet': upscale_srresnet
}

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        'status': 'success',
        'message': 'Server is running'
    })

def allowed_file(filename, ext):
    return ext in ALLOWED_EXTENSIONS


def get_file_size(file_path):
    return os.path.getsize(file_path)

        
@app.route('/upscale', methods=['POST'])
def upscale_image():
    try:
        if 'file' not in request.files or request.files['file'].filename == '':
            return error_response('No file selected or invalid file in request', 400)

        file = request.files['file']
        filename = file.filename
        ext = filename.rsplit('.', 1)[1].lower()
        pil_format, mime_type = FORMAT_MAP.get(ext, ('JPEG', 'image/jpeg'))

        method = request.form.get('method', 'gan').lower()
        
        if method not in UPSCALING_METHODS:
            return error_response(f'Invalid upscaling method. Allowed methods: {", ".join(UPSCALING_METHODS.keys())}', 400)

        upscale_func = UPSCALING_METHODS[method]

        if not allowed_file(filename, ext):
            return error_response('Invalid file type. Allowed types: PNG, JPG, JPEG', 400)

        upscaled_array = upscale_func(file)
        upscaled_image = Image.fromarray(upscaled_array[:, :, ::-1])

        img_io = io.BytesIO()
        upscaled_image.save(img_io, format=pil_format)
        img_io.seek(0)
        img_bytes = img_io.read()

        # Base64 encode the image bytes
        img_b64 = base64.b64encode(img_bytes).decode('utf-8')

        return jsonify({
            'status': 'success',
            'message': f'Image upscaled successfully using {method} method',
            'image': img_b64,
            'format': ext,
            'method': method
        })

    except Exception as e:
        logger.error(f"Error in /upscale route: {str(e)}")
        return jsonify({
            'status': 'error', 
            'message': 'Error processing upscale',
            'details': str(e)
        }), 500

    
if __name__ == '__main__':
    app.run(debug=True, port=5100)