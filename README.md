# Expense Sharing Backend

A Flask-based backend for managing shared expenses among groups.

## Features
- User management
- Group creation and management
- Expense tracking
- Balance calculations
- Next payer recommendation
- Transaction history

## API Endpoints
- `/api/users` - User management
- `/api/groups` - Group management
- `/api/expenses` - Expense tracking
- `/api/groups/<id>/balances` - Group balances
- `/api/groups/<id>/next-payer` - Next payer suggestion

## Development Setup
1. Install dependencies: `pip install -r requirements.txt`
2. Set up PostgreSQL database
3. Configure environment variables in `.env` file
4. Run: `python app.py`

## Deployment
Configure WSGI server (Gunicorn recommended) for production.