from flask import Flask
from flask_cors import CORS
from routes.users import bp as users_bp
from routes.groups import bp as groups_bp

app = Flask(__name__)
CORS(app)

# Register blueprints
app.register_blueprint(users_bp)
app.register_blueprint(groups_bp)

if __name__ == '__main__':
    app.run(debug=True)