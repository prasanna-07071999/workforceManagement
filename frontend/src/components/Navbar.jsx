import React from "react";
import { useHistory } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const history = useHistory();
  const { token, setToken } = useContext(AuthContext);

  let isAdmin = false;

  if (token) {
    try {
      const decoded = JSON.parse(atob(token.split(".")[1]));
      isAdmin = decoded.isAdmin;
    } catch {}
  }

  const handleLogout = () => {
   setToken(null);
    history.push("/login");
  };

  return (
    <nav
      className="d-flex justify-content-between align-items-center px-4 py-3 shadow-sm"
      style={{ background: "#4C4CFF", color: "white" }}
    >
      <h3 style={{ cursor: "pointer" }} onClick={() => history.push("/")}>
        WorkPulse
      </h3>

      <div className="d-flex gap-3">
        {!token ? (
          <>
            <button className="btn btn-light" onClick={() => history.push("/login")}>
              Login
            </button>
            <button className="btn btn-light" onClick={() => history.push("/register")}>
              Register
            </button>
          </>
        ) : (
          <>
            <button className="btn btn-light" onClick={() => history.push("/dashboard")}>
              Dashboard
            </button>
            <button className="btn btn-light" onClick={() => history.push("/employees")}>
              Employees
            </button>
            <button className="btn btn-light" onClick={() => history.push("/teams")}>
              Teams
            </button>

            {isAdmin && (
              <button className="btn btn-warning" onClick={() => history.push("/logs")}>
                Logs
              </button>
            )}

            <button className="btn btn-danger" onClick={handleLogout}>
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

