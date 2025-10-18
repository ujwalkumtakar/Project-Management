from flask import Blueprint, request, jsonify
from models import db, User
from werkzeug.security import generate_password_hash, check_password_hash
from utils import generate_token

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    if not data or not all(k in data for k in ("name","email","password","role")):
        return jsonify({"message":"name, email, password, role required"}), 400
    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"message":"Email already registered"}), 400
    hashed = generate_password_hash(data["password"])
    user = User(name=data["name"], email=data["email"], password_hash=hashed, role=data["role"])
    db.session.add(user)
    db.session.commit()
    token = generate_token(user)
    return jsonify({"message":"User created","token": token, "role": user.role}), 201

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    if not data or not data.get("email") or not data.get("password"):
        return jsonify({"message":"email and password required"}), 400
    user = User.query.filter_by(email=data["email"]).first()
    if not user:
        return jsonify({"message":"Invalid credentials"}), 401
    if not check_password_hash(user.password_hash, data["password"]):
        return jsonify({"message":"Invalid credentials"}), 401
    token = generate_token(user)
    return jsonify({"token": token, "role": user.role, "name": user.name}), 200
