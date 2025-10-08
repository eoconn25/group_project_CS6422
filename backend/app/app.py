from flask import Flask
import sqlite3
import os

app = Flask(__name__)
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
    return 'Placeholder'

# Upload route
@app.route('/upload')
def upload():
    return
