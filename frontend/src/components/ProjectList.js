import React, { useEffect, useState } from "react";
import API from "../services/api";

export default function ProjectList() {
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  const fetch = () => API.get("/projects").then(r=>setProjects(r.data.projects)).catch(()=>{});

  useEffect(()=>{ fetch(); }, []);

  const create = async () => {
    if (!name) return alert("Provide project name");
    try {
      await API.post("/projects", { name, description: desc });
      setName(""); setDesc("");
      fetch();
    } catch (err) { alert(err.response?.data?.message || "Error"); }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete project?")) return;
    try { await API.delete(`/projects/${id}`); fetch(); }
    catch (err) { alert(err.response?.data?.message || "Error"); }
  };

  return (
    <div className="container">
      <div className="card">
        <div className="header-row">
          <h3>Projects</h3>
          <div>
            <input placeholder="Project name" value={name} onChange={e=>setName(e.target.value)} style={{width:260, display:"inline-block", marginRight:8}}/>
            <button className="primary" onClick={create}>Create</button>
          </div>
        </div>
        <div style={{marginTop:12}}>
          <textarea placeholder="Description (optional)" value={desc} onChange={e=>setDesc(e.target.value)} rows={2}/>
        </div>
      </div>

      <div className="card">
        <h4>Existing Projects</h4>
        {projects.length === 0 ? <div className="small">No projects</div> : (
          <table className="table">
            <thead><tr><th>Name</th><th>Tasks</th><th>Overdue</th><th></th></tr></thead>
            <tbody>
            {projects.map(p=>(
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.task_count}</td>
                <td style={{color:p.overdue_count? "#ff6f61":"#6b6b6b"}}>{p.overdue_count}</td>
                <td><button className="accent" onClick={()=>remove(p.id)}>Delete</button></td>
              </tr>
            ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
