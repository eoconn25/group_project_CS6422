from app import app, init_db, home, ask

if __name__ == '__main__':
    print(app.ask())
    app.run(debug=True, host='0.0.0.0', port=5001)
