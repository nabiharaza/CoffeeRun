from flask import Blueprint, request, jsonify
from backend.utils.db import get_db_connection
import datetime

bp = Blueprint('expenses', __name__, url_prefix='/api/expenses')


@bp.route('', methods=['POST'])
def create_expense():
    """Create a new expense"""
    data = request.get_json()
    required_fields = ['group_id', 'paid_by', 'items']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400

    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500

    try:
        with conn.cursor() as cur:
            # Create expense
            cur.execute(
                '''INSERT INTO expenses (group_id, paid_by, description, amount, date)
                   VALUES (%s, %s, %s, %s, %s) RETURNING id''',
                (data['group_id'], data['paid_by'],
                 data.get('description', ''), data.get('amount', 0),
                 data.get('date', datetime.datetime.now()))
            )
            expense_id = cur.fetchone()[0]

            # Add expense items
            for item in data['items']:
                cur.execute(
                    '''INSERT INTO expense_items (expense_id, user_id, amount, description)
                       VALUES (%s, %s, %s, %s)''',
                    (expense_id, item['user_id'], item['amount'],
                     item.get('description', ''))
                )

            conn.commit()
            return jsonify({'id': expense_id}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        conn.close()