import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import pymysql

app = Flask(__name__)
CORS(app)

# Database connection pool settings
db_host = os.environ.get('DB_HOST', 'db')
db_user = os.environ.get('DB_USER', 'root')
db_password = os.environ.get('DB_PASSWORD', 'root')
db_name = os.environ.get('DB_NAME', 'app_db')

def get_db_connection():
    return pymysql.connect(
        host=db_host,
        user=db_user,
        password=db_password,
        database=db_name,
        cursorclass=pymysql.cursors.DictCursor
    )

@app.route('/users', methods=['POST'])
def create_user():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Invalid payload'}), 400
        
    name = data.get('name')
    email = data.get('email')

    if not name or not email:
        return jsonify({'error': 'Name and email are required'}), 400

    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            # Check for duplicate email (to match the previous Node.js behavior)
            cursor.execute('SELECT id FROM users WHERE email = %s', (email,))
            if cursor.fetchone():
                return jsonify({'error': 'Email already exists'}), 409
                
            cursor.execute(
                'INSERT INTO users (name, email) VALUES (%s, %s)',
                (name, email)
            )
            connection.commit()
            insert_id = cursor.lastrowid
            
        return jsonify({
            'id': insert_id,
            'name': name,
            'email': email,
            'message': 'User created successfully'
        }), 201
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': 'Internal server error'}), 500
    finally:
        connection.close()

@app.route('/users', methods=['GET'])
def get_users():
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute('SELECT id, name, email, created_at FROM users ORDER BY id DESC')
            rows = cursor.fetchall()
            return jsonify(rows), 200
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': 'Internal server error'}), 500
    finally:
        connection.close()

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok'}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
