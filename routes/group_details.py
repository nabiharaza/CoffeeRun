from flask import Blueprint, jsonify
from utils.db import get_db_connection

bp = Blueprint('group_details', __name__, url_prefix='/api/groups')


@bp.route('/<int:group_id>', methods=['GET'])
def get_group(group_id):
    """Get detailed information about a specific group"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500

    try:
        with conn.cursor() as cur:
            # Get group info
            cur.execute('SELECT * FROM groups WHERE id = %s', (group_id,))
            group = dict((cur.description[i][0], value)
                         for i, value in enumerate(cur.fetchone()))

            # Get members
            cur.execute('''
                SELECT u.id, u.name FROM users u
                JOIN group_members gm ON u.id = gm.user_id
                WHERE gm.group_id = %s
            ''', (group_id,))
            members = [dict((cur.description[i][0], value)
                            for i, value in enumerate(row)) for row in cur.fetchall()]
            group['members'] = members

            return jsonify(group)
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        conn.close()