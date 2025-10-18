from flask import Blueprint, request, jsonify
from models import db, Task, Project, User
from utils import token_required
from datetime import datetime

tasks_bp = Blueprint("tasks", __name__)

@tasks_bp.route("/tasks", methods=["POST"])
@token_required
def create_task(current_user):
    if current_user.role not in ("Admin","Manager"):
        return jsonify({"message":"Permission denied"}), 403
    data = request.get_json()
    if not data or not data.get("title") or not data.get("project_id"):
        return jsonify({"message":"title and project_id required"}), 400
    proj = Project.query.get(data["project_id"])
    if not proj:
        return jsonify({"message":"Project not found"}), 404
    deadline = None
    if data.get("deadline"):
        try:
            deadline = datetime.strptime(data["deadline"], "%Y-%m-%d")
        except:
            return jsonify({"message":"deadline format should be YYYY-MM-DD"}), 400
    task = Task(
        title=data["title"],
        description=data.get("description"),
        status=data.get("status", "To Do"),
        deadline=deadline,
        project_id=proj.id,
        user_id=data.get("user_id")
    )
    db.session.add(task)
    db.session.commit()
    return jsonify({"message":"Task created","id":task.id}), 201

@tasks_bp.route("/tasks", methods=["GET"])
@token_required
def get_tasks(current_user):
    # optional query params: project_id, user_id
    q = Task.query
    project_id = request.args.get("project_id")
    user_id = request.args.get("user_id")
    if project_id:
        q = q.filter_by(project_id=project_id)
    if user_id:
        q = q.filter_by(user_id=user_id)
    q = q.order_by(Task.created_at.desc())
    tasks = q.all()
    out = []
    for t in tasks:
        out.append({
            "id": t.id,
            "title": t.title,
            "description": t.description,
            "status": t.status,
            "deadline": t.deadline.strftime("%Y-%m-%d") if t.deadline else None,
            "project_id": t.project_id,
            "user_id": t.user_id
        })
    return jsonify({"tasks": out})

@tasks_bp.route("/tasks/<int:task_id>", methods=["PUT"])
@token_required
def update_task(current_user, task_id):
    task = Task.query.get_or_404(task_id)
    data = request.get_json()
    # Developers can update only status and add description (comment like)
    if current_user.role == "Developer" and task.user_id == current_user.id:
        if "status" in data:
            if data["status"] not in ("To Do","In Progress","Done"):
                return jsonify({"message":"Invalid status"}), 400
            task.status = data["status"]
        if "description" in data:
            task.description = data["description"]
        db.session.commit()
        return jsonify({"message":"Updated"})
    # Admin/Manager can update all
    if current_user.role in ("Admin","Manager"):
        if "title" in data: task.title = data["title"]
        if "description" in data: task.description = data["description"]
        if "status" in data and data["status"] in ("To Do","In Progress","Done"): task.status = data["status"]
        if "deadline" in data:
            try:
                task.deadline = datetime.strptime(data["deadline"], "%Y-%m-%d") if data["deadline"] else None
            except:
                return jsonify({"message":"deadline format should be YYYY-MM-DD"}), 400
        if "user_id" in data:
            if data["user_id"]:
                u = User.query.get(data["user_id"])
                if not u:
                    return jsonify({"message":"User not found"}), 404
                task.user_id = u.id
            else:
                task.user_id = None
        db.session.commit()
        return jsonify({"message":"Updated"})
    return jsonify({"message":"Permission denied"}), 403

@tasks_bp.route("/tasks/<int:task_id>", methods=["DELETE"])
@token_required
def delete_task(current_user, task_id):
    if current_user.role not in ("Admin","Manager"):
        return jsonify({"message":"Permission denied"}), 403
    task = Task.query.get_or_404(task_id)
    db.session.delete(task)
    db.session.commit()
    return jsonify({"message":"Deleted"})
