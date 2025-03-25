from flask import Blueprint, jsonify
from utils.db import create_connection, close_connection
from utils.calculations import calculate_net_balances
import logging

balances_bp = Blueprint('balances', __name__)

@balances_bp.route('/api/groups/<int:group_id>/detailed-balances', methods=['GET'])
def get_detailed_balances(group_id):
    conn, cursor = create_connection()
    net_balances, members = calculate_net_balances(group_id, cursor)

    detailed_balances = []
    member_dict = {m['id']: m for m in members}

    for debtor_id, creditors in net_balances.items():
        debtor = member_dict[debtor_id]
        creditor_details = []
        total_owed = 0.0

        for creditor_id, amount in creditors.items():
            creditor = member_dict[creditor_id]
            amount_float = float(amount)
            creditor_details.append({
                'user_id': creditor_id,
                'user_name': creditor['name'],
                'amount': amount_float
            })
            total_owed += amount_float

        detailed_balances.append({
            'user_id': debtor_id,
            'user_name': debtor['name'],
            'type': 'debtor',
            'total': round(total_owed, 2),
            'details': creditor_details
        })

    creditor_totals = {}
    for debtor_id, creditors in net_balances.items():
        for creditor_id, amount in creditors.items():
            if creditor_id not in creditor_totals:
                creditor_totals[creditor_id] = 0.0
            creditor_totals[creditor_id] += float(amount)

    for creditor_id, total in creditor_totals.items():
        creditor = member_dict[creditor_id]
        detailed_balances.append({
            'user_id': creditor_id,
            'user_name': creditor['name'],
            'type': 'creditor',
            'total': round(total, 2),
            'details': []
        })

    settled_members = [m for m in members
                      if m['id'] not in net_balances and
                      not any(m['id'] in debts for debts in net_balances.values())]

    for member in settled_members:
        detailed_balances.append({
            'user_id': member['id'],
            'user_name': member['name'],
            'type': 'settled',
            'total': 0.0,
            'details': []
        })

    close_connection(conn, cursor)
    return jsonify(detailed_balances)

@balances_bp.route('/api/groups/<int:group_id>/balances', methods=['GET'])
def get_group_balances(group_id):
    """Get simplified balances (who owes how much in total)"""
    conn, cursor = create_connection()

    net_balances, members = calculate_net_balances(group_id, cursor)

    # Convert to simpler format for frontend
    simplified_balances = []
    for member in members:
        total_owed = sum(net_balances.get(member['id'], {}).values())
        total_owed_to = sum(creditors.get(member['id'], 0)
                            for debtor, creditors in net_balances.items())
        balance = total_owed_to - total_owed

        simplified_balances.append({
            'user_id': member['id'],
            'user_name': member['name'],
            'balance': balance,
            'status': 'settled' if balance == 0 else
            'owed' if balance > 0 else 'owes'
        })

    close_connection(conn, cursor)
    return jsonify(simplified_balances)

@balances_bp.route('/api/groups/<int:group_id>/detailed-debts', methods=['GET'])
def get_detailed_debts(group_id):
    conn, cursor = create_connection()
    net_balances, members = calculate_net_balances(group_id, cursor)

    detailed_debts = []
    for debtor_id in net_balances:
        debtor = next(m for m in members if m['id'] == debtor_id)
        creditors = []
        total = 0.0

        for creditor_id in net_balances[debtor_id]:
            creditor = next(m for m in members if m['id'] == creditor_id)
            amount = float(net_balances[debtor_id][creditor_id])
            creditors.append({
                'user_id': creditor_id,
                'user_name': creditor['name'],
                'amount': amount
            })
            total += amount

        if creditors:
            detailed_debts.append({
                'debtor_id': debtor_id,
                'debtor_name': debtor['name'],
                'owes_to': creditors,
                'total': round(total, 2),
                'status': 'active'
            })

    settled_members = [m for m in members
                      if m['id'] not in net_balances and
                      not any(m['id'] in debts for debts in net_balances.values())]

    for member in settled_members:
        detailed_debts.append({
            'debtor_id': member['id'],
            'debtor_name': member['name'],
            'status': 'settled',
            'total': 0.0,
            'owes_to': []
        })

    close_connection(conn, cursor)
    return jsonify(detailed_debts)