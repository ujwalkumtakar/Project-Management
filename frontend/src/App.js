import React, { useState } from "react";
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import ProjectList from "./components/ProjectList";
import TaskList from "./components/TaskList";
import UserManagement from "./components/UserManagement";

export default function App() {
  const [role, setRole] = useState(localStorage.getItem("role") || null);
  const [tab, setTab] = useState("dashboard");

  const handleLogin = (r) => {
    setRole(r);
    setTab("dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    setRole(null);
  };

  if (!role) return <Login onLogin={handleLogin} />;

  return (
    <div>
      <Navbar role={role} setTab={setTab} onLogout={handleLogout} />
      {tab === "dashboard" && <Dashboard />}
      {tab === "projects" && <ProjectList />}
      {tab === "tasks" && <TaskList />}
      {tab === "users" && role === "Admin" && <UserManagement />}
    </div>
  );
}
