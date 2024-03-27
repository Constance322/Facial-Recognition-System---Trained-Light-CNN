from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import base64
import face_recognition

app = Flask(__name__)
CORS(app)  


IMAGE_FOLDER = '/home/constance/myimage'
app.config['UPLOAD_FOLDER'] = IMAGE_FOLDER

def load_known_face_info_for_id(access_id):
    known_face_info = []

    image_folder_path = os.path.join(app.config['UPLOAD_FOLDER'], access_id)

    for image_filename in os.listdir(image_folder_path):
        image_path = os.path.join(image_folder_path, image_filename)

        loaded_image = face_recognition.load_image_file(image_path)

        face_locations = face_recognition.face_locations(loaded_image)
        face_encodings = face_recognition.face_encodings(loaded_image, face_locations)

        if len(face_encodings) == 1:
            encoding = face_encodings[0]
            known_face_info.append({'encoding': encoding, 'name': access_id})

    return known_face_info

def recognize_face(captured_encoding, known_face_info):
    if not captured_encoding or len(captured_encoding) == 0:
        return "Access denied: No face detected in the captured image."

    if not known_face_info:
        return "Access denied: No registered faces available for comparison."

    distances = [face_recognition.face_distance([info['encoding']], captured_encoding[0])[0] for info in known_face_info]

    min_distance = min(distances)
    min_distance_index = distances.index(min_distance)
    recognized_info = known_face_info[min_distance_index]

    if min_distance < 0.6:
        return f"Access granted for ID: {recognized_info['name']}"
    else:
        return "Access denied: Face not recognized or unauthorized ID."

@app.route('/access', methods=['OPTIONS'])
def access_options():
    response = jsonify({'message': 'Preflight request successful'})
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
    response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
    return response

@app.route('/')
def serve():
    return "Welcome to Facial Recognition API!"

@app.route('/add_access', methods=['POST'])
def add_access():
    try:
        data = request.get_json()
        access_id = data['id']
        captured_image_path = data['capturedImage']

        image_binary = base64.b64decode(captured_image_path.split(',')[1])
        image_folder_path = os.path.join(app.config['UPLOAD_FOLDER'], access_id)
        os.makedirs(image_folder_path, exist_ok=True)

        image_filename = f"{access_id}_{len(os.listdir(image_folder_path)) + 1}.png"
        image_path = os.path.join(image_folder_path, image_filename)

        with open(image_path, 'wb') as img_file:
            img_file.write(image_binary)

        known_face_info = load_known_face_info_for_id(access_id)

        captured_encodings = face_recognition.face_encodings(face_recognition.load_image_file(image_path))

        result = recognize_face(captured_encodings, known_face_info)

        return jsonify({'message': result}), 200

    except Exception as e:
        print("Error:", str(e))
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5003, debug=True)
