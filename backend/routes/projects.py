from flask import Blueprint, request, jsonify
from models import db, Project, Task
from utils import token_required
from datetime import datetime

projects_bp = Blueprint("projects", __name__)

@projects_bp.route("/projects", methods=["POST"])
@token_required
def create_project(current_user):
    if current_user.role not in ("Admin","Manager"):
        return jsonify({"message":"Permission denied"}), 403
    data = request.get_json()
    if not data or not data.get("name"):
        return jsonify({"message":"Project name required"}), 400
    p = Project(name=data["name"], description=data.get("description"))
    db.session.add(p)
    db.session.commit()
    return jsonify({"message":"Project created", "id": p.id}), 201

@projects_bp.route("/projects", methods=["GET"])
@token_required
def get_projects(current_user):
    projects = Project.query.order_by(Project.created_at.desc()).all()
    out = []
    for p in projects:
        total = len(p.tasks)
        done = sum(1 for t in p.tasks if t.status == "Done")
        overdue = sum(1 for t in p.tasks if t.deadline and t.deadline < datetime.utcnow() and t.status != "Done")
        out.append({
            "id": p.id, "name": p.name, "description": p.description,
            "task_count": total, "done_count": done, "overdue_count": overdue
        })
    return jsonify({"projects": out})

@projects_bp.route("/projects/<int:project_id>", methods=["PUT"])
@token_required
def update_project(current_user, project_id):
    if current_user.role not in ("Admin","Manager"):
        return jsonify({"message":"Permission denied"}), 403
    p = Project.query.get_or_404(project_id)
    data = request.get_json()
    if "name" in data: p.name = data["name"]
    if "description" in data: p.description = data["description"]
    db.session.commit()
    return jsonify({"message":"Updated"})

@projects_bp.route("/projects/<int:project_id>", methods=["DELETE"])
@token_required
def delete_project(current_user, project_id):
    if current_user.role not in ("Admin","Manager"):
        return jsonify({"message":"Permission denied"}), 403
    p = Project.query.get_or_404(project_id)
    db.session.delete(p)
    db.session.commit()
    return jsonify({"message":"Deleted"})
