from flask import Flask, jsonify
from config import Config
from models import db
from flask_cors import CORS
import os

def create_app():
    app = Flask(__name__, static_folder=None)
    app.config.from_object(Config)
    db.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # register blueprints
    from routes.auth import auth_bp
    from routes.users import users_bp
    from routes.projects import projects_bp
    from routes.tasks import tasks_bp

    app.register_blueprint(auth_bp, url_prefix="/api")
    app.register_blueprint(users_bp, url_prefix="/api")
    app.register_blueprint(projects_bp, url_prefix="/api")
    app.register_blueprint(tasks_bp, url_prefix="/api")

    @app.route("/api/ping")
    def ping():
        return jsonify({"message":"pong"})

    @app.before_first_request
    def create_tables():
        db.create_all()
        # create a default admin if not exists
        from models import User
        from werkzeug.security import generate_password_hash
        if not User.query.filter_by(email="ujwalkumtakar5@gmail.com").first():
            admin = User(name="Ujwal", email="ujwalkumtakar5@gmail.com", password_hash=generate_password_hash("password123"), role="Admin")
            db.session.add(admin)
            db.session.commit()

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=int(os.environ.get("PORT", 5000)))
