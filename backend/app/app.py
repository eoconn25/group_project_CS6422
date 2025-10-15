from flask import Flask, jsonify
from flask_cors import CORS
import sqlite3
import os

app = Flask(__name__)
# This is for production
# CORS(app, resources={r"/api/*": {"origins": "http://frontend:3000"}})
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

db_path = os.path.join(os.path.dirname(__file__), 'database.db')

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
