from flask import Flask, request, jsonify
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def home():
    return jsonify({'message': 'Welcome to the Flask Image Upload API'}), 200

@app.route('/upload', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and allowed_file(file.filename):
        filepath = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(filepath)
        
        mock_response = {
            'status': 'success',
            'message': 'Image received successfully',
            'details': {
                'original_size': os.path.getsize(filepath),
                'filename': file.filename,
                'mock_upscale_factor': 2.0
            }
        }
        
        return jsonify(mock_response), 200
    
    return jsonify({'error': 'Invalid file type'}), 400

@app.route('/status', methods=['GET'])
def server_status():
    return jsonify({'status': 'running'}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)
