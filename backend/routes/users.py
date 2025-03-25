from flask import Blueprint, jsonify, request
from utils.db import create_connection, close_connection
from psycopg2 import IntegrityError
import logging

users_bp = Blueprint('users', __name__)

@users_bp.route('/api/users', methods=['GET'])
def get_users():
    logging.info("GET /api/users - Retrieving all users")
    conn, cursor = create_connection()
    if not conn:
        return {"error": "Database connection failed"}, 500

    try:
        cursor.execute("SELECT * FROM users")
        # Get column names from cursor description
        columns = [column[0] for column in cursor.description]
        # Convert each row to a dictionary
        users = [dict(zip(columns, row)) for row in cursor.fetchall()]
        return {"users": users}, 200
    except Exception as e:
        return {"error": str(e)}, 500
    finally:
        close_connection(conn, cursor)

@users_bp.route('/api/users', methods=['POST'])
def create_user():
    logging.info("POST /api/users - Creating new user")
    data = request.json

    if not data or 'name' not in data:
        logging.warning("Name is required but not provided")
        return jsonify({"error": "Name is required"}), 400

    conn, cursor = create_connection()

    try:
        cursor.execute('INSERT INTO users (name, email) VALUES (%s, %s) RETURNING id',
                      (data['name'], data.get('email')))
        conn.commit()
        user_id = cursor.fetchone()[0]
        logging.info(f"Successfully created user with ID: {user_id}")

        close_connection(conn, cursor)
        return jsonify({"id": user_id, "name": data['name'], "email": data.get('email')}), 201
    except IntegrityError as e:
        logging.error(f"IntegrityError while creating user: {e}")
        close_connection(conn, cursor)
        return jsonify({"error": "Email already exists"}), 400

@users_bp.route('/api/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    logging.info(f"GET /api/users/{user_id} - Retrieving user details")
    conn, cursor = create_connection()

    cursor.execute('SELECT * FROM users WHERE id = %s', (user_id,))
    user = cursor.fetchone()
    if user is None:
        logging.warning(f"User with ID {user_id} not found")
        close_connection(conn, cursor)
        return jsonify({"error": "User not found"}), 404
    user_dict = dict(user)

    # Get groups this user belongs to
    cursor.execute('''
        SELECT g.* FROM groups g
        JOIN group_members gm ON g.id = gm.group_id
        WHERE gm.user_id = %s
    ''', (user_id,))
    groups = [dict(row) for row in cursor.fetchall()]
    user_dict['groups'] = groups
    logging.debug(f"User belongs to {len(groups)} groups")

    close_connection(conn, cursor)
    return jsonify(user_dict)