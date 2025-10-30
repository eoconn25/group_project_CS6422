from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from trained_model.cnn_inference import ClassifyFlower
from trained_model.model_init import get_model
import traceback
#from werkzeug.utils import secure_filename

app = Flask(__name__)
# app.run(host="0.0.0.0", port=5001) # commented for now

# This is for production
# CORS(app, resources={r"/api/*": {"origins": "http://frontend:5173"}})
# old dev version
# CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})
# new dev version
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})

db_path = os.path.join(os.path.dirname(__file__), 'database.db')

# Directory for temporary picture uploads
PHOTO_UPLOAD_FOLDER = "uploads"
os.makedirs(PHOTO_UPLOAD_FOLDER, exist_ok=True)

# Load your CNN model
model = ClassifyFlower(get_model, 'trained_model/test1.2_best_model.pt', "trained_model/flowers_segmentation_model.pt")

def init_db():
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
      userid INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      hpword TEXT NOT NULL
    ) ''')
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS uploads (
      fileid INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      userid INTEGER NOT NULL
    ) ''')
    conn.commit()
    conn.close()
    return None


# Home route
@app.route('/')
def home():
    return jsonify(message = "Hi")

# Upload route
@app.route('/upload')
def upload():
    return

@app.route('/predict', methods=['POST'])
def predict():
    # Ensure file is in request
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'Empty filename'}), 400


    # Save uploaded file temporarily
    filename = 'test_img'
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
        # Clean up temp file (optional)
        if os.path.exists(filepath):
            os.remove(filepath)