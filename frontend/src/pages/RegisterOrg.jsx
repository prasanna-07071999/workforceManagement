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
    <div className="row shadow-lg bg-white rounded-4 w-75 overflow-hidden">
      <div
        className="col-md-6 d-flex flex-column justify-content-center p-5 text-white"
        style={{ backgroundColor: "#16558f" }}
      >
        <h2 className="fw-bold mb-3">WorkPulse</h2>

        <p className="mb-4">
          A workforce management & analytics platform built for modern
          organizations to manage employees, teams, and operational insights.
        </p>

        <ul className="small ps-3">
          <li className="mb-2">Role-based access for Admins & Employees</li>
          <li className="mb-2">Employee & Team management</li>
          <li className="mb-2">Secure authentication & audit logs</li>
          <li className="mb-2">Scalable & deployment-ready architecture</li>
        </ul>

        <div className="mt-4">
          <span className="small">Already have an account?</span>
          <Link
            to="/login"
            className="btn btn-outline-light btn-sm ms-2"
          >
            Login
          </Link>
        </div>
      </div>

      {/* RIGHT FORM PANEL */}
      <div className="col-md-6 p-5">
        <h4 className="fw-bold mb-1 text-center">
          Create Organization
        </h4>
        <p className="text-muted text-center mb-4 small">
          Admin registration only. Employees are added internally.
        </p>

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
              placeholder="e.g. Acme Corporation"
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
              placeholder="Your full name"
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
              placeholder="admin@company.com"
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              required
            />
          </div>

          <button className="btn btn-primary w-100">
            Create Organization
          </button>
        </form>
      </div>
    </div>
  </div>
);

};

export default RegisterOrg