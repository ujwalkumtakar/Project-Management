import React, { useState } from "react";
import API from "../services/api";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    try {
      const res = await API.post("/login", { email, password });
      const { token, role, name } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("name", name || "");
      onLogin(role);
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  }

  return (
    <div style={{maxWidth:420, margin:"80px auto"}}>
      <div className="card">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <label>Email</label>
          <input value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Enter your email" />
          <label>Password</label>
          <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Enter your password" />
          <div style={{display:"flex", gap:8}}>
            <button type="submit" className="primary">Login</button>
            <button type="button" className="secondary" onClick={() => { setEmail("ujwalkumtakar5@gmail.com"); setPassword("password123"); }}>Fill Admin</button>
          </div>
        </form>
      </div>
    </div>
  );
}
