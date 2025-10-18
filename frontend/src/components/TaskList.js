import React, { useEffect, useState } from "react";
import API from "../services/api";

export default function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);

  const [form, setForm] = useState({
    title:"", description:"", project_id:"", user_id:"", deadline:""
  });

  const fetchAll = () => {
    API.get("/tasks").then(r=>setTasks(r.data.tasks)).catch(()=>{});
    API.get("/projects").then(r=>setProjects(r.data.projects)).catch(()=>{});
    API.get("/users").then(r=>setUsers(r.data.users)).catch(()=>{});
  };

  useEffect(()=>{ fetchAll(); }, []);

  const create = async () => {
    if (!form.title || !form.project_id) return alert("Title & project required");
    try {
      await API.post("/tasks", form);
      setForm({title:"", description:"", project_id:"", user_id:"", deadline:""});
      fetchAll();
    } catch (err) { alert(err.response?.data?.message || "Error"); }
  };

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/tasks/${id}`, { status });
      fetchAll();
    } catch (err) { alert(err.response?.data?.message || "Error"); }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete task?")) return;
    try {
      await API.delete(`/tasks/${id}`);
      fetchAll();
    } catch (err) { alert(err.response?.data?.message || "Error"); }
  };

  return (
    <div className="container">
      <div className="card">
        <h3>Create Task</h3>
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:10}}>
          <div>
            <label>Title</label>
            <input value={form.title} onChange={e=>setForm({...form, title: e.target.value})}/>
            <label>Project</label>
            <select value={form.project_id} onChange={e=>setForm({...form, project_id: e.target.value})}>
              <option value="">Select project</option>
              {projects.map(p=> <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <label>Assignee</label>
            <select value={form.user_id} onChange={e=>setForm({...form, user_id: e.target.value})}>
              <option value="">Unassigned</option>
              {users.map(u=> <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
            </select>
          </div>
          <div>
            <label>Deadline</label>
            <input type="date" value={form.deadline} onChange={e=>setForm({...form, deadline: e.target.value})}/>
            <label>Description</label>
            <textarea rows={5} value={form.description} onChange={e=>setForm({...form, description: e.target.value})}/>
          </div>
        </div>
        <div style={{marginTop:10}}>
          <button className="primary" onClick={create}>Create Task</button>
        </div>
      </div>

      <div className="card">
        <h4>Tasks</h4>
        {tasks.length === 0 ? <div className="small">No tasks</div> : (
          <table className="table">
            <thead><tr><th>Title</th><th>Project</th><th>Assignee</th><th>Status</th><th>Deadline</th><th>Actions</th></tr></thead>
            <tbody>
              {tasks.map(t=>(
                <tr key={t.id}>
                  <td>{t.title}</td>
                  <td>{t.project_id}</td>
                  <td>{t.user_id || "-"}</td>
                  <td>{t.status}</td>
                  <td style={{color: t.deadline && (new Date(t.deadline) < new Date()) ? "#ff6f61" : "#6b6b6b"}}>
                    {t.deadline || "-"}
                  </td>
                  <td style={{display:"flex", gap:8}}>
                    <button onClick={()=>updateStatus(t.id,"To Do")}>To Do</button>
                    <button onClick={()=>updateStatus(t.id,"In Progress")}>In Progress</button>
                    <button onClick={()=>updateStatus(t.id,"Done")}>Done</button>
                    <button className="accent" onClick={()=>remove(t.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
