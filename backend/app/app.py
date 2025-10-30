from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import os
from trained_model.cnn_inference import ClassifyFlower
from trained_model.model_init import get_model
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.run(host="0.0.0.0", port=5001)
# This is for production
# CORS(app, resources={r"/api/*": {"origins": "http://frontend:5173"}})
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})

db_path = os.path.join(os.path.dirname(__file__), 'database.db')


# Directory for temporary picture uploads
PHOTO_UPLOAD_FOLDER = "uploads"
os.makedirs(PHOTO_UPLOAD_FOLDER, exist_ok=True)

# Load your CNN model
model = ClassifyFlower(get_model, 'trained_model/test1.2_best_model.pt', "trained_model/flower_segmentation_model.pt")

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
    filename = secure_filename(file.filename)
    filepath = os.path.join(PHOTO_UPLOAD_FOLDER, filename)
    file.save(filepath)
    print(f"Saved file to: {filepath}")

    try:
        # Run your model
        result_param1, result_param2 = model.clfr.predict(filepath)
        print("Model output:", result_param1, result_param2)

        # Return as JSON
        return jsonify({
            'species': result_param1,
            'color': result_param2
        })

    except Exception as e:
        print("Prediction error:", str(e))
        return jsonify({'error': str(e)}), 500

    finally:
        # Clean up temp file (optional)
        if os.path.exists(filepath):
            os.remove(filepath)