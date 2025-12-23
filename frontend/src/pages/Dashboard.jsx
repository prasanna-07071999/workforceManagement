import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { BASE_URL } from "../services/api";

const Dashboard = () => {
  const history = useHistory();
  const token = localStorage.getItem("jwt");

  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalTeams: 0,
    totalAdmins: 0
  });

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    organisation: "",
    isAdmin: false
  });

  useEffect(() => {
    if (!token) return;

    try {
      const decoded = JSON.parse(atob(token.split(".")[1]));
      setProfile({
        name: decoded.name,
        email: decoded.email,
        organisation: decoded.organisationName || "Organisation",
        isAdmin: decoded.isAdmin
      });
    } catch (err) {
      console.error("JWT Decode Error:", err);
    }
  }, [token]);

  /* ---------------------------
     Fetch Dashboard Stats
  ----------------------------*/
  useEffect(() => {
    if (!token) return;

    const fetchStats = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/stats/summary`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        if (!response.ok) {
          throw new Error("Failed to fetch stats");
        }

        const data = await response.json();
        setStats(data);
        console.log("Fetching stats with token:", token);
      } catch (error) {
        console.error("Failed to fetch stats:", error.message);
      }
    };

    fetchStats();
  }, [token]);


  const handleLogout = () => {
    localStorage.removeItem("jwt");
    history.push("/login");
  };

  useEffect(() => {
    if (!token) {
        history.push("/login");
    }
}, [token, history]);


  return (
    <div className="container my-4">
      <div className="card shadow-sm p-4 mb-4" style={{ borderRadius: "15px" }}>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h3 className="mb-1">{profile.name}</h3>
            <p className="mb-0 text-muted">{profile.email}</p>
            <p className="text-primary fw-bold mt-2">
              {profile.organisation}
            </p>
          </div>
          <div>
            <span className="badge bg-dark p-2">
              {profile.isAdmin ? "Administrator" : "User"}
            </span>
          </div>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card p-3 shadow-sm text-center">
            <i className="bi bi-people-fill fs-2 text-primary"></i>
            <h4>Total Employees</h4>
            <p className="fs-3 fw-bold">{stats.totalEmployees}</p>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card p-3 shadow-sm text-center">
            <i className="bi bi-collection-fill fs-2 text-success"></i>
            <h4>Total Teams</h4>
            <p className="fs-3 fw-bold">{stats.totalTeams}</p>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card p-3 shadow-sm text-center">
            <i className="bi bi-person-badge-fill fs-2 text-warning"></i>
            <h4>Total Admins</h4>
            <p className="fs-3 fw-bold">{stats.totalAdmins}</p>
          </div>
        </div>

      </div>

      <div className="card p-4 shadow-sm mb-4" style={{ borderRadius: "15px" }}>
        <h4 className="mb-3">Quick Actions</h4>

        <div className="d-grid gap-3">

          <button
            className="btn btn-primary btn-lg"
            onClick={() => history.push("/employees")}
          >
            <i className="bi bi-person-lines-fill me-2"></i>
            Manage Employees
          </button>

          <button
            className="btn btn-dark btn-lg"
            onClick={() => history.push("/teams")}
          >
            <i className="bi bi-grid-fill me-2"></i>
            Manage Teams
          </button>

          {profile.isAdmin && (
            <button
              className="btn btn-warning btn-lg"
              onClick={() => history.push("/logs")}
            >
              <i className="bi bi-journal-text me-2"></i>
              View Logs
            </button>
          )}

          <button
            className="btn btn-danger btn-lg"
            onClick={handleLogout}
          >
            <i className="bi bi-box-arrow-right me-2"></i>
            Logout
          </button>

        </div>
      </div>
    </div>
  );
};

export default Dashboard