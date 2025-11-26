from app import app, create_tables, dump_database
import sys

if __name__ == '__main__':
    create_tables()
    with app.app_context():
        print(dump_database())
        sys.stdout.flush()
    app.run(debug=True, host='0.0.0.0', port=5001)
