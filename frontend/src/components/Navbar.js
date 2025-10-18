import React from "react";

export default function Navbar({ role, setTab, onLogout }) {
  return (
    <div className="navbar">
      <div className="brand">Project Management Tool</div>
      <div className="nav-actions">
        <button onClick={() => setTab("dashboard")}>Dashboard</button>
        <button onClick={() => setTab("projects")}>Projects</button>
        <button onClick={() => setTab("tasks")}>Tasks</button>
        {role === "Admin" && <button onClick={() => setTab("users")}>Users</button>}
        <button onClick={onLogout}>Logout</button>
      </div>
    </div>
  );
}
