from flask import Blueprint, request, jsonify
from utils.db import get_db_connection

bp = Blueprint('users', __name__, url_prefix='/api/users')


@bp.route('', methods=['GET'])
def get_users():
    """Get all users"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500

    try:
        with conn.cursor() as cur:
            cur.execute('SELECT * FROM users;')
            users = [dict((cur.description[i][0], value)
                          for i, value in enumerate(row)) for row in cur.fetchall()]
        return jsonify(users)
    finally:
        conn.close()


@bp.route('', methods=['POST'])
def create_user():
    """Create a new user"""
    data = request.get_json()
    if not data or 'name' not in data:
        return jsonify({'error': 'Name is required'}), 400

    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500

    try:
        with conn.cursor() as cur:
            cur.execute('INSERT INTO users (name, email) VALUES (%s, %s) RETURNING id, name, email',(data['name'], data.get('email')))
            user = dict((cur.description[i][0], value)
                        for i, value in enumerate(cur.fetchone()))
            conn.commit()
            return jsonify(user), 201
    except Exception as e:
        return jsonify({'error': 'Email already exists'}), 400
    finally:
        conn.close()