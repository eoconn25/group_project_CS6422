from app import app, init_db, home

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
