from app import app, create_tables

if __name__ == '__main__':
    create_tables()
    app.run(debug=True, host='0.0.0.0', port=5001)
