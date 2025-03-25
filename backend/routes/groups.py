from flask import Blueprint, request, jsonify
from utils.db import get_db_connection

bp = Blueprint('groups', __name__, url_prefix='/api/groups')


@bp.route('', methods=['GET'])
def get_groups():
    """Get all groups"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500

    try:
        with conn.cursor() as cur:
            cur.execute('SELECT * FROM groups;')
            groups = [dict((cur.description[i][0], value)
                           for i, value in enumerate(row)) for row in cur.fetchall()]
        return jsonify(groups)
    finally:
        conn.close()


@bp.route('', methods=['POST'])
def create_group():
    """Create a new group"""
    data = request.get_json()
    if not data or 'name' not in data:
        return jsonify({'error': 'Name is required'}), 400

    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500

    try:
        with conn.cursor() as cur:
            cur.execute(
                'INSERT INTO groups (name, description) VALUES (%s, %s) RETURNING id, name, description',
                (data['name'], data.get('description', '')))
            group = dict((cur.description[i][0], value)
                         for i, value in enumerate(cur.fetchone()))
            conn.commit()
            return jsonify(group), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        conn.close()