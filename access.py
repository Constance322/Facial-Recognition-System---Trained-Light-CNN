from flask import Flask, request, jsonify, send_file
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from io import BytesIO
import os
import base64

app = Flask(__name__)
CORS(app, supports_credentials=True) 


IMAGE_FOLDER = '/home/constance/myimage'
app.config['UPLOAD_FOLDER'] = IMAGE_FOLDER

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///site.db'  
db = SQLAlchemy(app)

class Access(db.Model):
    ID = db.Column(db.String(50), primary_key=True)
    Name = db.Column(db.String(255), nullable=False)
    ImagePath = db.Column(db.String(255), nullable=False)  
@app.route('/store_access', methods=['POST'])
def store_access():
    data = request.json

    existing_access = Access.query.filter_by(ID=data.get('id')).first()

    if existing_access:
        return jsonify(message='ID already exists. Please use a different ID.'), 400

    image_data = data.get('image').split(',')[1].encode()
    image_filename = f"{data.get('id')}_{data.get('name')}.png"  
    image_path = os.path.join(app.config['UPLOAD_FOLDER'], image_filename)

    with open(image_path, 'wb') as img_file:
        img_file.write(base64.b64decode(image_data))

    new_access = Access(
        ID=data.get('id'),
        Name=data.get('name'),
        ImagePath=image_path,
    )

    db.session.add(new_access)
    db.session.commit()

    return jsonify(message='Image captured')

@app.route('/', methods=['GET'])
def index():
    return 'Welcome to the Access API'

@app.route('/get_access', methods=['GET'])
def get_access():
    access_data = Access.query.all()
    access_list = [{'id': item.ID, 'name': item.Name, 'imagePath': item.ImagePath} for item in access_data]
    return jsonify(access_list)

@app.route('/get_image/<string:id>', methods=['GET'])
def get_image(id):
    access_data = Access.query.get(id)
    
    if access_data:
        image_path = access_data.ImagePath
        return send_file(image_path, mimetype='image/png')
    else:
        return jsonify(message='Access data not found.'), 404

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5002)
