import React, { useEffect, useState } from "react";
import API from "../services/api";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({name:"", email:"", password:"", role:"Developer"});

  const fetch = () => API.get("/users").then(r=>setUsers(r.data.users)).catch(()=>{});

  useEffect(()=>{ fetch(); }, []);

  const create = async () => {
    if (!form.name || !form.email || !form.password) return alert("Fill fields");
    try {
      await API.post("/users", form);
      setForm({name:"", email:"", password:"", role:"Developer"});
      fetch();
    } catch (err) { alert(err.response?.data?.message || "Error"); }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete user?")) return;
    try { await API.delete(`/users/${id}`); fetch(); }
    catch (err) { alert(err.response?.data?.message || "Error"); }
  };

  return (
    <div className="container">
      <div className="card">
        <h3>Create User</h3>
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:10}}>
          <div>
            <label>Name</label>
            <input value={form.name} onChange={e=>setForm({...form, name:e.target.value})}/>
            <label>Email</label>
            <input value={form.email} onChange={e=>setForm({...form, email:e.target.value})}/>
          </div>
          <div>
            <label>Password</label>
            <input type="password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})}/>
            <label>Role</label>
            <select value={form.role} onChange={e=>setForm({...form, role:e.target.value})}>
              <option>Admin</option>
              <option>Manager</option>
              <option>Developer</option>
            </select>
          </div>
        </div>
        <div style={{marginTop:10}}>
          <button className="primary" onClick={create}>Create User</button>
        </div>
      </div>

      <div className="card">
        <h4>Users</h4>
        <table className="table">
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Actions</th></tr></thead>
          <tbody>
            {users.map(u=>(
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td><button className="accent" onClick={()=>remove(u.id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
