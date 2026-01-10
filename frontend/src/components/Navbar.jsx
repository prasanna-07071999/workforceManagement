import React, { useContext, useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Navbar = ({ onToggleSidebar }) => {
  const history = useHistory();
  const { token, logout } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);

  const user = useMemo(() => {
    if (!token) return null;
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch {
      return null;
    }
  }, [token]);

  const handleLogout = () => {
    logout();
    history.push("/login");
  };

  if (!token || !user) return null;

  return (
    <nav
      className="px-3 px-md-4 py-2 shadow-sm"
      style={{
        backgroundColor: "#1f2937",
        color: "#ffffff",
        borderBottom: "1px solid #374151",
      }}
    >
      <div className="d-flex justify-content-between align-items-center">

        {/* LEFT: Sidebar Toggle (MOBILE ONLY) + App Name */}
        <div className="d-flex align-items-center gap-3">
          {/* Sidebar toggle only on mobile */}
          <button
            className="btn btn-outline-light d-md-none"
            onClick={onToggleSidebar}
          >
            <i className="bi bi-list fs-5"></i>
          </button>

          <h4
            className="mb-0"
            style={{ cursor: "pointer", lineHeight: 1 }}
            onClick={() => history.push("/dashboard")}
          >
            WorkPulse
          </h4>
        </div>

        {/* RIGHT: DESKTOP USER INFO (STRAIGHT LINE) */}
        <div className="d-none d-md-flex align-items-center gap-3">
          {/* Name + Email */}
          <div className="d-flex flex-column text-end lh-sm">
            <span className="fw-bold">{user.name}</span>
            <small className="text-muted">{user.email}</small>
          </div>

          {/* Organisation */}
          <span className="badge bg-secondary px-3 py-2">
            {user.organisationName}
          </span>

          {/* Role */}
          <span className="badge bg-dark px-3 py-2">
            {user.isAdmin ? "Administrator" : "Employee"}
          </span>

          {/* Logout */}
          <button
            className="btn btn-outline-danger btn-sm px-3"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>

        {/* RIGHT: MOBILE USER MENU ICON */}
        <button
          className="btn btn-outline-light d-md-none"
          onClick={() => setMenuOpen(prev => !prev)}
        >
          <i className="bi bi-three-dots-vertical"></i>
        </button>
      </div>

      {/* MOBILE USER MENU */}
      {menuOpen && (
        <div className="d-md-none mt-3 border-top pt-3">
          <div className="mb-2">
            <strong>{user.name}</strong>
            <div className="small text-muted">{user.email}</div>
          </div>

          <div className="mb-2">
            <span className="badge bg-secondary me-2">
              {user.organisationName}
            </span>
            <span className="badge bg-dark">
              {user.isAdmin ? "Administrator" : "Employee"}
            </span>
          </div>

          <button
            className="btn btn-outline-danger btn-sm w-100 mt-2"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar