from flask import Blueprint, jsonify, request
from utils.db import create_connection, close_connection
from utils.calculations import calculate_net_balances, determine_next_payer
from psycopg2 import IntegrityError
import logging

# Create blueprint with correct name and /api prefix
groups_bp = Blueprint('groups', __name__, url_prefix='/api')

@groups_bp.route('/groups', methods=['GET'])
def get_groups():
    logging.info("GET /api/groups - Retrieving all groups")
    conn, cursor = create_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        cursor.execute('SELECT * FROM groups')
        columns = [column[0] for column in cursor.description]
        groups = [dict(zip(columns, row)) for row in cursor.fetchall()]
        logging.debug(f"Retrieved {len(groups)} groups")

        for group in groups:
            cursor.execute('''
                SELECT COUNT(*) as member_count
                FROM group_members
                WHERE group_id = %s
            ''', (group['id'],))
            result = cursor.fetchone()
            group['member_count'] = result[0] if result else 0

        return jsonify(groups)
    except Exception as e:
        logging.error(f"Error in get_groups: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500
    finally:
        close_connection(conn, cursor)

@groups_bp.route('/groups', methods=['POST'])
def create_group():
    logging.info("POST /api/groups - Creating new group")
    data = request.json
    if not data or 'name' not in data:
        logging.warning("Group name is required but not provided")
        return jsonify({"error": "Name is required"}), 400

    conn, cursor = create_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        cursor.execute('INSERT INTO groups (name, description) VALUES (%s, %s) RETURNING id',
                       (data['name'], data.get('description', '')))
        conn.commit()
        group_id = cursor.fetchone()[0]
        logging.info(f"Successfully created group with ID: {group_id}")

        if 'members' in data and isinstance(data['members'], list):
            logging.debug(f"Adding {len(data['members'])} initial members to group")
            for user_id in data['members']:
                cursor.execute('INSERT INTO group_members (group_id, user_id) VALUES (%s, %s)', (group_id, user_id))
            conn.commit()

        return jsonify({"id": group_id, "name": data['name'], "description": data.get('description', '')}), 201
    except Exception as e:
        conn.rollback()
        logging.error(f"Error in create_group: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500
    finally:
        close_connection(conn, cursor)


@groups_bp.route('/groups/<int:group_id>', methods=['GET'])
def get_group(group_id):
    logging.info(f"GET /api/groups/{group_id} - Retrieving group details")
    conn, cursor = create_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        # Get group details
        cursor.execute('SELECT * FROM groups WHERE id = %s', (group_id,))
        group = cursor.fetchone()
        if group is None:
            logging.warning(f"Group with ID {group_id} not found")
            return jsonify({"error": "Group not found"}), 404
        group_dict = dict(group)

        # Get group members
        cursor.execute('''
            SELECT u.* FROM users u
            JOIN group_members gm ON u.id = gm.user_id
            WHERE gm.group_id = %s
        ''', (group_id,))
        members = [dict(row) for row in cursor.fetchall()]
        group_dict['members'] = members
        logging.debug(f"Group has {len(members)} members")

        # Get group expenses
        cursor.execute('''
            SELECT e.*, u.name as paid_by_name FROM expenses e
            JOIN users u ON e.paid_by = u.id
            WHERE e.group_id = %s
            ORDER BY e.date DESC
        ''', (group_id,))
        expenses = [dict(row) for row in cursor.fetchall()]
        logging.debug(f"Group has {len(expenses)} expenses")

        # Get items for each expense
        for expense in expenses:
            cursor.execute('''
                SELECT ei.*, u.name as user_name FROM expense_items ei
                JOIN users u ON ei.user_id = u.id
                WHERE ei.expense_id = %s
            ''', (expense['id'],))
            items = [dict(row) for row in cursor.fetchall()]
            expense['items'] = items

        group_dict['expenses'] = expenses

        # Calculate balances
        balances = calculate_net_balances(group_id, cursor)
        group_dict['balances'] = balances

        return jsonify(group_dict)
    except Exception as e:
        logging.error(f"Error in get_group: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500
    finally:
        close_connection(conn, cursor)
@groups_bp.route('/groups/<int:group_id>/members', methods=['POST'])
def add_group_member(group_id):
    logging.info(f"POST /api/groups/{group_id}/members - Adding member to group")
    data = request.json

    if not data or 'user_id' not in data:
        logging.warning("User ID is required but not provided")
        return jsonify({"error": "User ID is required"}), 400

    conn, cursor = create_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        cursor.execute('INSERT INTO group_members (group_id, user_id) VALUES (%s, %s)',
                      (group_id, data['user_id']))
        conn.commit()
        logging.info(f"Successfully added user {data['user_id']} to group {group_id}")
        return jsonify({"success": True}), 201
    except IntegrityError as e:
        conn.rollback()
        logging.error(f"IntegrityError while adding member: {e}")
        return jsonify({"error": "User is already a member or invalid user/group"}), 400
    except Exception as e:
        conn.rollback()
        logging.error(f"Error in add_group_member: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500
    finally:
        close_connection(conn, cursor)

@groups_bp.route('/groups/<int:group_id>/next-payer', methods=['GET'])
def get_next_payer(group_id):
    conn, cursor = create_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        next_payer = determine_next_payer(group_id, cursor)

        if not next_payer:
            cursor.execute('''
                SELECT u.* FROM users u
                JOIN group_members gm ON u.id = gm.user_id
                WHERE gm.group_id = %s
                ORDER BY RANDOM()
                LIMIT 1
            ''', (group_id,))
            columns = [column[0] for column in cursor.description]
            next_payer = dict(zip(columns, cursor.fetchone()))

        net_balances, members = calculate_net_balances(group_id, cursor)
        user_debts = {m['id']: 0 for m in members}
        for debtor in net_balances:
            for creditor in net_balances[debtor]:
                user_debts[debtor] += net_balances[debtor][creditor]

        response = {
            "next_payer": next_payer,
            "reason": "owes_the_most" if next_payer and next_payer['id'] in user_debts else "random",
            "balances": [{"user_id": m['id'], "name": m['name'], "balance": user_debts.get(m['id'], 0)}
                         for m in members]
        }

        return jsonify(response)
    except Exception as e:
        logging.error(f"Error in get_next_payer: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500
    finally:
        close_connection(conn, cursor)