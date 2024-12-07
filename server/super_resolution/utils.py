from flask import jsonify

def success_response(details):
    response = jsonify({
        'status': 'success',
        'message': 'File uploaded and processed successfully',
        'details': details
    })
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173'
    return response


def error_response(message, status_code, details=None):
    response = jsonify({
        'status': 'error',
        'message': message,
        'details': details
    })
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173'
    return response, status_code