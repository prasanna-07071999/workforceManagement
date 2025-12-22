import React, { useState, useContext } from "react";
import { useHistory, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { BASE_URL } from "../services/api";

const RegisterOrg = () => {
  const history = useHistory();
  const { setToken } = useContext(AuthContext);

  const [orgName, setOrgName] = useState("");
  const [adminName, setAdminName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleRegister = async (event) => {
    event.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const url = `${BASE_URL}/api/auth/register`;

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgName,
          adminName,
          email,
          password  
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMsg(data.message || "Registration Failed");
        return;
      }

      setToken(data.token);

      setSuccessMsg("Organization Registered Successfully! Redirecting...");
      setTimeout(() => history.push("/login"), 1800);

    } catch (error) {
      setErrorMsg("Something went wrong");
    }
  };

  return (
    <div
      className="container-fluid vh-100 d-flex align-items-center justify-content-center"
      style={{ background: "#f3f6fa" }}
    >
      <div className="row shadow-lg bg-white rounded p-4 w-75">

        <div
          className="col-md-6 d-flex flex-column justify-content-center text-center p-4"
          style={{ backgroundColor: "#16558f", borderRadius: "10px" }}
        >
          <h2 className="text-white fw-bold">WorkPulse - Workforce Management & Analytics Platform</h2>
          <p className="text-light mt-3">
            A fast & secure way to manage employees, teams, and organization data.
          </p>

          <ul className="text-start text-light mt-3 small">
            <li>📌 Create and Manage Employees</li>
            <li>📌 Assign Employees to Teams</li>
            <li>📌 Audit Logs for Admin</li>
            <li>📌 Fully Authentication Protected</li>
            <li>📌 PostgreSQL + Deployment Optimized</li>
          </ul>

          <div className="text-center mt-3">
            <p className="fw-bold btn btn-outline-light w-75">
              Already Registered? <Link to="/login" className="text-dark">Login</Link>
            </p>
          </div>
        </div>


        <div className="col-md-6 p-4">
          <h3 className="fw-bold text-center mb-3">Register Organization</h3>

          {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}
          {successMsg && <div className="alert alert-success">{successMsg}</div>}

          <form onSubmit={handleRegister}>

            <div className="mb-3">
              <label className="form-label">Organization Name</label>
              <input
                type="text"
                className="form-control"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Admin Name</label>
              <input
                type="text"
                className="form-control"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Admin Email</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Admin Password</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button className="btn btn-primary w-100" type="submit">
              Register Organization
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default RegisterOrg