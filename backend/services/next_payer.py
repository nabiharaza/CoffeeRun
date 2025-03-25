from backend.services.balance_calculator import calculate_balances


def determine_next_payer(group_id, cursor):
    """Determine who should pay next based on debts"""
    balances = calculate_balances(group_id, cursor)

    if not balances:
        return None

    # Find user with maximum debt (most negative balance)
    next_payer_id = min(balances.items(), key=lambda x: x[1])[0]

    # Get user details
    cursor.execute('SELECT * FROM users WHERE id = %s', (next_payer_id,))
    return cursor.fetchone()