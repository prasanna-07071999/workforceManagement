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
        <h6 className="text-uppercase mb-3" style={{ color: "#e5e7eb" }}>
          {isAdmin ? "Admin Panel" : "Employee Panel"}
        </h6>

        <ul className="nav nav-pills flex-column gap-2">
          <SidebarItem path="/dashboard" icon="speedometer2" label="Dashboard" active={isActive} />

          {isAdmin && (
            <>
              <SidebarItem path="/employees" icon="people-fill" label="Employees" active={isActive} />
              <SidebarItem path="/teams" icon="grid-fill" label="Teams" active={isActive} />
              <SidebarItem path="/projects" icon="briefcase-fill" label="Projects" active={isActive} />
              <SidebarItem path="/recruitment" icon="person-lines-fill" label="Recruitment" active={isActive} />
              <SidebarItem path="/attendance" icon="calendar-check-fill" label="Attendance" active={isActive} />
              <SidebarItem path="/leaves" icon="calendar-event-fill" label="Leaves" active={isActive} />
              <SidebarItem path="/holidays" icon="calendar-event-fill" label="Holidays" active={isActive} />
              <SidebarItem path="/daily-updates" icon="clipboard-check-fill" label="Daily Updates" active={isActive} />
              <SidebarItem path="/logs" icon="journal-text" label="Logs" active={isActive} />
            </>
          )}

          {!isAdmin && (
            <>
              <SidebarItem path="/attendance" icon="clock-fill" label="My Attendance" active={isActive} />
              <SidebarItem path="/leaves" icon="calendar-check-fill" label="My Leaves" active={isActive} />
              <SidebarItem path="/projects" icon="briefcase-fill" label="My Projects" active={isActive} />
              <SidebarItem path="/daily-updates" icon="clipboard-check-fill" label="Daily Updates" active={isActive} />

              {mustChangePassword && (
                <SidebarItem path="/change-password" icon="key-fill" label="Change Password" active={isActive} />
              )}
            </>
          )}
        </ul>
      </aside>
    </>
  );
};

const SidebarItem = ({ path, icon, label, active }) => (
  <li className="nav-item">
    <Link
      to={path}
      className={`nav-link ${active(path) ? "active" : "text-white"}`}
    >
      <i className={`bi bi-${icon} me-2`}></i>
      {label}
    </Link>
  </li>
);

export default Sidebar;