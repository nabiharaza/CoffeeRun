from flask import Blueprint, jsonify, request
from utils.db import create_connection, close_connection
import datetime
import logging

expenses_bp = Blueprint('expenses', __name__)

@expenses_bp.route('/api/expenses', methods=['POST'])
def create_expense():
    logging.info("POST /api/expenses - Creating new expense")
    data = request.json
    if not data or 'group_id' not in data or 'paid_by' not in data or 'items' not in data:
        logging.warning("Required fields (group_id, paid_by, items) not provided")
        return jsonify({"error": "Group ID, paid by user ID, and items are required"}), 400

    conn, cursor = create_connection()

    cursor.execute('''
        INSERT INTO expenses (group_id, paid_by, description, date)
        VALUES (%s, %s, %s, %s) RETURNING id
    ''', (data['group_id'], data['paid_by'], data.get('description', 'Coffee Run'),
          data.get('date', datetime.datetime.now().isoformat())))
    conn.commit()

    expense_id = cursor.fetchone()[0]
    logging.info(f"Successfully created expense with ID: {expense_id}")

    for item in data['items']:
        if 'user_id' not in item or 'amount' not in item:
            continue

        cursor.execute('''
            INSERT INTO expense_items (expense_id, user_id, amount, description)
            VALUES (%s, %s, %s, %s)
        ''', (expense_id, item['user_id'], item['amount'], item.get('description', '')))

    conn.commit()
    logging.debug(f"Added {len(data['items'])} items to expense")

    cursor.execute('SELECT * FROM expenses WHERE id = %s', (expense_id,))
    expense = dict(cursor.fetchone())

    cursor.execute('SELECT * FROM expense_items WHERE expense_id = %s', (expense_id,))
    items = [dict(row) for row in cursor.fetchall()]
    expense['items'] = items

    close_connection(conn, cursor)
    return jsonify(expense), 201

@expenses_bp.route('/api/expenses/<int:expense_id>/update-payer', methods=['PATCH'])
def update_expense_payer(expense_id):
    logging.info(f"PATCH /api/expenses/{expense_id}/update-payer - Updating expense payer")
    data = request.json

    if not data or 'paid_by' not in data:
        logging.warning("Payer ID is required but not provided")
        return jsonify({"error": "Payer ID is required"}), 400

    conn, cursor = create_connection()

    try:
        cursor.execute('''
            UPDATE expenses
            SET paid_by = %s
            WHERE id = %s
        ''', (data['paid_by'], expense_id))
        conn.commit()
        logging.info(f"Successfully updated payer for expense {expense_id}")

        close_connection(conn, cursor)
        return jsonify({"success": True}), 200
    except Exception as e:
        logging.error(f"Error while updating payer: {e}")
        close_connection(conn, cursor)
        return jsonify({"error": str(e)}), 400

@expenses_bp.route('/api/groups/<int:group_id>/transaction-history', methods=['GET'])
def get_transaction_history(group_id):
    conn, cursor = create_connection()

    cursor.execute('''
        SELECT e.*, u.name as paid_by_name 
        FROM expenses e
        JOIN users u ON e.paid_by = u.id
        WHERE e.group_id = %s
        ORDER BY e.date DESC
    ''', (group_id,))
    expenses = [dict(row) for row in cursor.fetchall()]

    for expense in expenses:
        cursor.execute('''
            SELECT ei.*, u.name as user_name 
            FROM expense_items ei
            JOIN users u ON ei.user_id = u.id
            WHERE ei.expense_id = %s
        ''', (expense['id'],))
        items = [dict(row) for row in cursor.fetchall()]
        expense['items'] = items
        expense['total'] = round(sum(item['amount'] for item in items), 2)

    close_connection(conn, cursor)
    return jsonify(expenses)