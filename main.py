import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
from psycopg2 import OperationalError, IntegrityError

app = Flask(__name__)
CORS(app)


# Database connection helper
def get_db_connection():
    conn = psycopg2.connect(
        host=os.getenv('DB_HOST'),
        database=os.getenv('DB_NAME'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD')
    )
    return conn


# Basic user routes
@app.route('/api/users', methods=['GET'])
def get_users():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('SELECT * FROM users;')
    users = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(users)


@app.route('/api/users', methods=['POST'])
def create_user():
    data = request.get_json()
    if 'name' not in data:
        return jsonify({'error': 'Name is required'}), 400

    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            'INSERT INTO users (name, email) VALUES (%s, %s) RETURNING id',
            (data['name'], data.get('email'))
        )
        user_id = cur.fetchone()[0]
        conn.commit()
        return jsonify({'id': user_id, 'name': data['name'], 'email': data.get('email')}), 201
    except IntegrityError:
        return jsonify({'error': 'Email already exists'}), 400
    finally:
        cur.close()
        conn.close()


if __name__ == '__main__':
    app.run(debug=True)