from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, decode_token
from flask_sqlalchemy import SQLAlchemy
import datetime
import sqlite3
import os
import sys
import time
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from trained_model.cnn_inference import ClassifyFlower
from trained_model.model_init import get_model
from trained_model.llm import SmartAss
import traceback
#from werkzeug.utils import secure_filename

#db_path = os.path.join(os.path.dirname(__file__), 'database.db')

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*", "allow_headers": ["Content-Type", "Authorization"], "methods": ["POST", "OPTIONS"]}})
#CORS(app)
app.config['SECRET_KEY'] = 'ChangeThisProbably'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:////app/app/instance/database.db'

db = SQLAlchemy(app)
jwt = JWTManager(app)

llm = SmartAss()

# app.run(host="0.0.0.0", port=5001) # commented for now

# This is for production
# CORS(app, resources={r"/api/*": {"origins": "http://frontend:5173"}})
# old dev version
# CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})
# new dev version

#CORS(app, origins=["http://react:5173"])

#CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})

# Directory for temporary picture uploads
PHOTO_UPLOAD_FOLDER = "uploads"
os.makedirs(PHOTO_UPLOAD_FOLDER, exist_ok=True)

# Load your CNN model
model = ClassifyFlower(get_model, 'trained_model/test1.2_best_model.pt', "trained_model/flowers_segmentation_model.pt")

# Using SQLAlchemy have a class corresponding to each table
class User(db.Model):
    userid = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)

class UserChats(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    userid = db.Column(db.Integer, nullable=False)
    chatGroup = db.Column(db.String(100), nullable=False)
    msgSeq = db.Column(db.Integer, nullable=False)
    msgText = db.Column(db.Text, nullable=False)
    isModel = db.Column(db.Boolean)

class UserUploadedImages(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    userid = db.Column(db.Integer, nullable=False)
    filepath = db.Column(db.String(256), nullable=False)

class PinnedFlowers(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    userid = db.Column(db.Integer, nullable=False)
    flowerKey = db.Column(db.String(100), nullable=False)

def getUser(request):
    auth_header = request.headers.get("Authorization")
    
    guest_identity = {"username": "guest", "userid": 0}

    if not auth_header:
        return guest_identity

    return decode_token(auth_header.split(" ")[1])

@app.route("/getUploadedImages", methods=["POST"])
def getUploadedImages():
    try:
        token = getUser(request)
        userid = token["userid"]
        uploadedImages = UserUploadedImages.query.filter_by(userid=userid).all()
        return jsonify(uploadedImages), 200

    except Exception as e:
        return jsonify(f"Error: ${e}"), 200

@app.route("/getChats", methods=["POST"])
def getChats():
    ...

@app.route("/getPinnedFlowers", methods=["POST"])
def getPinnedFlowers():
    ...

@app.route("/saveChat", methods=["POST"])
def saveChat():
    ...

@app.route("/savePinnedFlower", methods=["POST"])
def savePinnedFlower():
    ...

# 2025-11-05 this works for now....
@app.route("/ask", methods=["POST"])
def ask():
    data = request.get_json()  # get json from frontend
    print("data: ", data)
    prompt = data.get("prompt", "")
    print("prompt: ", prompt)
    reply = llm.prompt(prompt)  # prompt llm
    print("reply: ", reply)
    return jsonify({"response": reply})  # return json response to frontend

# Home route
@app.route('/')
def home():
    return jsonify(message = 'Hi')

# Upload route
@app.route('/upload')
def upload():
    return

# Register
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data['username']
    password = data['password']

    if User.query.filter_by(username=username).first():
        return jsonify(message='User already exists'), 400
    
    new_user = User(username=username, password=password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify(message='User created successfully'), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data['username']
    password = data['password']

    user = User.query.filter_by(username=username, password=password).first()

    if not user :
        return jsonify(message='Login Failed'), 400

    access_token = create_access_token(identity=username, additional_claims={"userid": user.userid, "username": username}, expires_delta=datetime.timedelta(days=7))
    return jsonify(message='Login Successful', token=access_token), 200

def create_tables():
    with app.app_context():
        db.create_all()

@app.route('/predict', methods=['POST'])
def predict():
    # Ensure file is in request
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'Empty filename'}), 400

    # Get the userid (if they have one)
    token = getUser(request)
    print(request.headers.get("Authorization"))
    print(request)

    # Save uploaded image
    filename = f'${token["username"]}-${time.time()}'
    filepath = os.path.join(PHOTO_UPLOAD_FOLDER, filename)
    file.save(filepath)
    print(f"Saved file to: {filepath}")
    
    # Debugging logs
    print(f"Model: {model}")
    print(f"File exists? {os.path.exists(filepath)}")

    try:
        # Run your model
        result_param1, result_param2 = model.predict(filepath)
        print("Model output:", result_param1, result_param2)

        # Return as JSON
        return jsonify({
            'species': result_param1,
            'color': result_param2
        })

    except Exception as e:
        tb = traceback.format_exc()
        print("Prediction error:", tb)
        # Send traceback back to frontend for debugging
        return jsonify({
            'error': str(e),
            'traceback': tb
        }), 500

    finally:
        # Clean up temp file if their userid is 0 (not logged in)
        if os.path.exists(filepath) and token["userid"] == 0:
            os.remove(filepath)
            print("I actually hate everything")
            print(token["userid"])
            print(token)
            #print(request.headers.get("Authorization"))
            print(request.headers)
            sys.stdout.flush()
        else:
            print("this is a test")
            sys.stdout.flush()
            # Add the new image to the db
            newImage = UserUploadedImages(userid=token["userid"], filepath=filepath)
            db.session.add(newImage)
            db.session.commit()
