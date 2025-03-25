def calculate_net_balances(group_id, cursor):
    cursor.execute('''
        SELECT e.paid_by as creditor, ei.user_id as debtor, ei.amount
        FROM expenses e
        JOIN expense_items ei ON e.id = ei.expense_id
        WHERE e.group_id = %s AND e.paid_by != ei.user_id
    ''', (group_id,))
    transactions = cursor.fetchall()

    cursor.execute('''
        SELECT u.id, u.name FROM users u
        JOIN group_members gm ON u.id = gm.user_id
        WHERE gm.group_id = %s
    ''', (group_id,))
    members = [dict(row) for row in cursor.fetchall()]

    balances = {m['id']: {m2['id']: 0 for m2 in members} for m in members}

    for t in transactions:
        creditor = t['creditor']
        debtor = t['debtor']
        amount = t['amount']
        balances[debtor][creditor] += amount

    net_balances = {}
    for debtor in balances:
        for creditor in balances[debtor]:
            if balances[debtor][creditor] > balances[creditor][debtor]:
                net_amount = balances[debtor][creditor] - balances[creditor][debtor]
                if debtor not in net_balances:
                    net_balances[debtor] = {}
                net_balances[debtor][creditor] = net_amount

    return net_balances, members

def determine_next_payer(group_id, cursor):
    net_balances, members = calculate_net_balances(group_id, cursor)

    user_debts = {m['id']: 0 for m in members}
    for debtor in net_balances:
        for creditor in net_balances[debtor]:
            user_debts[debtor] += net_balances[debtor][creditor]

    if not user_debts:
        return None

    max_debtor = max(user_debts.items(), key=lambda x: x[1])[0]
    return next(m for m in members if m['id'] == max_debtor)