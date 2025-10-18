from flask import Blueprint, request, jsonify
from models import db, User
from werkzeug.security import generate_password_hash
from utils import token_required, admin_required

users_bp = Blueprint("users", __name__)

@users_bp.route("/users", methods=["GET"])
@token_required
def list_users(current_user):
    users = User.query.all()
    out = []
    for u in users:
        out.append({"id":u.id, "name":u.name, "email":u.email, "role":u.role})
    return jsonify({"users": out})

@users_bp.route("/users", methods=["POST"])
@token_required
@admin_required
def create_user(current_user):
    data = request.get_json()
    if not data or not all(k in data for k in ("name","email","password","role")):
        return jsonify({"message":"name, email, password, role required"}), 400
    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"message":"Email exists"}), 400
    hashed = generate_password_hash(data["password"])
    user = User(name=data["name"], email=data["email"], password_hash=hashed, role=data["role"])
    db.session.add(user)
    db.session.commit()
    return jsonify({"message":"User created","id":user.id}), 201

@users_bp.route("/users/<int:user_id>", methods=["PUT"])
@token_required
@admin_required
def update_user(current_user, user_id):
    user = User.query.get_or_404(user_id)
    data = request.get_json()
    if "name" in data: user.name = data["name"]
    if "role" in data: user.role = data["role"]
    db.session.commit()
    return jsonify({"message":"Updated"})

@users_bp.route("/users/<int:user_id>", methods=["DELETE"])
@token_required
@admin_required
def delete_user(current_user, user_id):
    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    return jsonify({"message":"Deleted"})
