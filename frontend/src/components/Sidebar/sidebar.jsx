import React, { useContext, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import "./sidebar.css";

const Sidebar = ({ isOpen, onClose }) => {
  const { token } = useContext(AuthContext);
  const location = useLocation();

  const user = useMemo(() => {
    if (!token) return null;
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch {
      return null;
    }
  }, [token]);

  if (!user) return null;

  const isAdmin = user.isAdmin;
  const mustChangePassword = user.mustChangePassword;
  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* MOBILE OVERLAY */}
      {isOpen && (
        <div className="sidebar-overlay d-md-none" onClick={onClose} />
      )}

      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <h6 className="text-uppercase mb-3 text-white">
          {isAdmin ? "Admin Panel" : "Employee Panel"}
        </h6>

        <ul className="nav nav-pills flex-column gap-2">
          <SidebarItem path="/dashboard" icon="speedometer2" label="Dashboard" isActive={isActive} onClick={onClose} />

          {isAdmin && (
            <>
              <SidebarItem path="/employees" icon="people-fill" label="Employees" isActive={isActive} onClick={onClose} />
              <SidebarItem path="/teams" icon="grid-fill" label="Teams" isActive={isActive} onClick={onClose} />
              <SidebarItem path="/projects" icon="briefcase-fill" label="Projects" isActive={isActive} onClick={onClose} />
              <SidebarItem path="/recruitment" icon="person-lines-fill" label="Recruitment" isActive={isActive} onClick={onClose} />
              <SidebarItem path="/attendance" icon="calendar-check-fill" label="Attendance" isActive={isActive} onClick={onClose} />
              <SidebarItem path="/leaves" icon="calendar-event-fill" label="Leaves" isActive={isActive} onClick={onClose} />
              <SidebarItem path="/holidays" icon="calendar-event-fill" label="Holidays" isActive={isActive} onClick={onClose} />
              <SidebarItem path="/daily-updates" icon="clipboard-check-fill" label="Daily Updates" isActive={isActive} onClick={onClose} />
              <SidebarItem path="/logs" icon="journal-text" label="Logs" isActive={isActive} onClick={onClose} />
            </>
          )}

          {!isAdmin && (
            <>
              <SidebarItem path="/attendance" icon="clock-fill" label="My Attendance" isActive={isActive} onClick={onClose} />
              <SidebarItem path="/leaves" icon="calendar-check-fill" label="My Leaves" isActive={isActive} onClick={onClose} />
              <SidebarItem path="/projects" icon="briefcase-fill" label="My Projects" isActive={isActive} onClick={onClose} />
              <SidebarItem path="/daily-updates" icon="clipboard-check-fill" label="Daily Updates" isActive={isActive} onClick={onClose} />

              {mustChangePassword && (
                <SidebarItem path="/change-password" icon="key-fill" label="Change Password" isActive={isActive} onClick={onClose} />
              )}
            </>
          )}
        </ul>
      </aside>
    </>
  );
};

const SidebarItem = ({ path, icon, label, isActive, onClick }) => (
  <li className="nav-item">
    <Link
      to={path}
      onClick={onClick}
      className={`nav-link ${isActive(path) ? "active" : "text-white"}`}
    >
      <i className={`bi bi-${icon} me-2`} />
      {label}
    </Link>
  </li>
);

export default Sidebar;
