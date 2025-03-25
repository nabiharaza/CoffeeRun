from .users import users_bp
from .groups import groups_bp
from .expenses import expenses_bp
from .balances import balances_bp

def init_routes(app):
    app.register_blueprint(users_bp, url_prefix='/api')
    app.register_blueprint(groups_bp, url_prefix='/api')
    app.register_blueprint(expenses_bp, url_prefix='/api')
    app.register_blueprint(balances_bp, url_prefix='/api')