import React, { useContext, useMemo, useState, useRef, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Navbar = ({ onToggleSidebar }) => {
  const history = useHistory();
  const { token, logout } = useContext(AuthContext);

  const [open, setOpen] = useState(false);
  const menuRef = useRef();

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

  // close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!token || !user) return null;

  return (
    <nav
      className="px-3 px-md-4 py-2 shadow-sm d-flex justify-content-between align-items-center"
      style={{
        backgroundColor: "#111827",
        color: "#fff",
        borderBottom: "1px solid #374151",
      }}
    >

      {/* LEFT */}
      <div className="d-flex align-items-center gap-3">
        <button
          className="btn btn-outline-light d-md-none"
          onClick={onToggleSidebar}
        >
          <i className="bi bi-list fs-5"></i>
        </button>

        <h5
          className="mb-0 fw-bold"
          style={{ cursor: "pointer" }}
          onClick={() => history.push("/dashboard")}
        >
          WorkPulse
        </h5>
      </div>

      <div className="d-flex align-items-center gap-3 position-relative" ref={menuRef}>

        {/* 🔔 NOTIFICATION */}
        <i
          className="bi bi-bell fs-5"
          style={{ cursor: "pointer" }}
          title="Notifications"
          onClick={() => alert("Notifications coming soon")}
        ></i>

        {/* 🌙 THEME */}
        <i
          className="bi bi-moon fs-5"
          style={{ cursor: "pointer" }}
          title="Toggle Theme"
          onClick={() => document.body.classList.toggle("dark-mode")}
        ></i>

        {/* 👤 PROFILE ICON */}
        <div
          onClick={() => setOpen(prev => !prev)}
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            background: "#374151",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          {user.name?.charAt(0).toUpperCase()}
        </div>

        {/* 🔥 DROPDOWN (ADD THIS) */}
        {open && (
          <div
            className="position-absolute"
            style={{
              top: "110%",
              right: 0,
              width: 250,
              background: "#fff",
              color: "#000",
              borderRadius: "10px",
              padding: "12px",
              zIndex: 9999,
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
            }}
          >

            {/* USER INFO */}
            <div className="mb-2">
              <div className="fw-bold">{user.name}</div>
              <div className="small text-muted">{user.email}</div>
            </div>

            <hr />

            {/* ORG */}
            <div className="mb-2">
              <span className="badge bg-secondary">
                {user.organisationName}
              </span>
            </div>

            {/* ROLE */}
            <div className="mb-2">
              <span className="badge bg-dark">
                {user.isAdmin ? "Administrator" : "Employee"}
              </span>
            </div>

            <hr />

            {/* ACTIONS */}
            <button
              className="btn btn-outline-primary btn-sm w-100 mb-2"
              onClick={() => history.push("/change-password")}
            >
              Change Password
            </button>

            <button
              className="btn btn-danger btn-sm w-100"
              onClick={handleLogout}
            >
              Logout
            </button>

          </div>
        )}

      </div>

    </nav>
  );
};

export default Navbar