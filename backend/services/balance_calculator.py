def calculate_balances(group_id, cursor):
    """Calculate how much each user has paid vs. consumed"""
    # Get total paid by each user
    cursor.execute('''
        SELECT e.paid_by as user_id, SUM(ei.amount) as total_paid
        FROM expenses e
        JOIN expense_items ei ON e.id = ei.expense_id
        WHERE e.group_id = %s
        GROUP BY e.paid_by
    ''', (group_id,))
    paid = {row[0]: row[1] for row in cursor.fetchall()}

    # Get total consumed by each user
    cursor.execute('''
        SELECT ei.user_id, SUM(ei.amount) as total_consumed
        FROM expense_items ei
        JOIN expenses e ON ei.expense_id = e.id
        WHERE e.group_id = %s
        GROUP BY ei.user_id
    ''', (group_id,))
    consumed = {row[0]: row[1] for row in cursor.fetchall()}

    # Calculate net balances
    balances = {}
    all_users = set(list(paid.keys()) + list(consumed.keys()))
    for user_id in all_users:
        balances[user_id] = paid.get(user_id, 0) - consumed.get(user_id, 0)

    return balances