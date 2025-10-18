from functools import wraps
from flask import request, jsonify
import jwt
from config import Config
from models import User, db
from datetime import datetime, timedelta

def generate_token(user):
    payload = {
        "user_id": user.id,
        "role": user.role,
        "exp": datetime.utcnow() + timedelta(seconds=Config.TOKEN_EXPIRE_SECONDS)
    }
    token = jwt.encode(payload, Config.SECRET_KEY, algorithm=Config.JWT_ALGORITHM)
    # pyjwt returns str in modern versions
    return token

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        # look for token in header
        if 'x-access-token' in request.headers:
            token = request.headers['x-access-token']
        if not token:
            return jsonify({"message": "Token is missing!"}), 401
        try:
            data = jwt.decode(token, Config.SECRET_KEY, algorithms=[Config.JWT_ALGORITHM])
            current_user = User.query.get(data['user_id'])
            if not current_user:
                raise Exception("User not found")
            # Attach current_user and role to kwargs
            kwargs['current_user'] = current_user
        except Exception as e:
            return jsonify({"message": "Token is invalid or expired", "error": str(e)}), 401
        return f(*args, **kwargs)
    return decorated

def admin_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        user = kwargs.get("current_user")
        if not user or user.role != "Admin":
            return jsonify({"message": "Admin privileges required"}), 403
        return f(*args, **kwargs)
    return wrapper
