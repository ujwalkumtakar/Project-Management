import React, { useEffect, useState } from "react";
import API from "../services/api";

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    API.get("/projects").then(res => setProjects(res.data.projects)).catch(()=>{});
    API.get("/tasks").then(res => setTasks(res.data.tasks)).catch(()=>{});
  }, []);

  const todo = tasks.filter(t => t.status === "To Do").length;
  const inProgress = tasks.filter(t => t.status === "In Progress").length;
  const done = tasks.filter(t => t.status === "Done").length;
  const overdue = tasks.filter(t => t.deadline && new Date(t.deadline) < new Date() && t.status !== "Done").length;

  const getProgressPercent = (project) => {
    if (!project.task_count) return 0;
    return Math.round((project.done_count / project.task_count) * 100);
  }

  return (
    <div className="container">
      {/* Task Counts */}
      <div className="stats">
        <div className="card stat">
          <h3>To Do</h3>
          <h2>{todo}</h2>
          <div className="small">Tasks to start</div>
        </div>
        <div className="card stat">
          <h3>In Progress</h3>
          <h2>{inProgress}</h2>
          <div className="small">Active tasks</div>
        </div>
        <div className="card stat">
          <h3>Done</h3>
          <h2>{done}</h2>
          <div className="small">Completed tasks</div>
        </div>
        <div className="card stat">
          <h3>Overdue</h3>
          <h2 style={{color:"#ff6f61"}}>{overdue}</h2>
          <div className="small">Overdue tasks</div>
        </div>
      </div>

      {/* Projects with progress bars */}
      <div style={{marginTop:24}}>
        {projects.map(p => {
          const progress = getProgressPercent(p);
          return (
            <div className="card" key={p.id}>
              <div className="header-row">
                <h3>{p.name}</h3>
                <span className="small">{p.task_count} tasks, {p.overdue_count} overdue</span>
              </div>
              <p className="small">{p.description || "No description"}</p>
              <div style={{
                background: "#e0e0e0",
                borderRadius: 10,
                height: 16,
                overflow: "hidden",
                marginTop: 8
              }}>
                <div style={{
                  width: `${progress}%`,
                  background: "#003366", /* primary deep blue */
                  height: "100%",
                  transition: "width 0.4s ease"
                }} />
              </div>
              <div className="small" style={{marginTop:4}}>{progress}% completed</div>
            </div>
          );
        })}
        {projects.length === 0 && <div className="small">No projects yet</div>}
      </div>
    </div>
  );
}
