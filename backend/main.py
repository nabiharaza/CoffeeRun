from flask import Flask
import logging
from flask_cors import CORS

# Create the Flask app
app = Flask(__name__)
CORS(app)

# Import and initialize routes
from routes.balances import balances_bp
from routes.expenses import expenses_bp
from routes.users import users_bp
from routes.groups import groups_bp

# Import other route blueprints as needed

# Register blueprints
app.register_blueprint(balances_bp)
app.register_blueprint(expenses_bp)
app.register_blueprint(users_bp)

app.register_blueprint(groups_bp)

if __name__ == '__main__':
    logging.info("Starting application")
    app.run(debug=True, host='0.0.0.0', port=5001)