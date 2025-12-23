import React, { useState, useContext} from "react"
import { AuthContext } from "../context/AuthContext"
import { useHistory } from "react-router-dom"
import { BASE_URL } from "../services/api"

const Login = () => {
    const history = useHistory()
    const { setToken } = useContext(AuthContext);
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [errorMsg, setErrorMsg] = useState("")

    const handleLogin = async (event) => {
        event.preventDefault()
        try {
            const url = `${BASE_URL}/api/auth/login`
            const options = {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            }
            const response = await fetch(url, options)
            const data = await response.json()
            if (!response.ok) {
                setErrorMsg(data.message || "Invalid credentials")
                return
            }
            setToken(data.token)
            history.push("/dashboard");
        }catch (error) {
        setErrorMsg("Something went wrong")
        }
    }

    return (
  <div
    className="container-fluid vh-100 d-flex align-items-center justify-content-center"
    style={{ background: "#f3f6fa" }}
  >
    <div className="row bg-white shadow rounded-4 w-75 overflow-hidden">

      {/* LEFT INFO PANEL */}
      <div
        className="col-md-6 d-flex flex-column justify-content-center p-5 text-white"
        style={{ backgroundColor: "#16558f" }}
      >
        <h2 className="fw-bold mb-3">WorkPulse</h2>

        <p className="mb-4">
          A workforce management platform that enables organizations to
          manage employees and teams with secure, role-based access.
        </p>

        <ul className="small ps-3 mb-0">
          <li className="mb-2">Admin & Employee login</li>
          <li className="mb-2">Secure authentication using JWT</li>
          <li className="mb-2">Employee and team management</li>
          <li className="mb-2">Audit logs for administrative actions</li>
        </ul>
      </div>

      {/* RIGHT LOGIN FORM */}
      <div className="col-md-6 p-5">
        <h4 className="fw-bold text-center mb-1">Login</h4>
        <p className="text-muted text-center mb-4 small">
          Sign in to access your organization workspace
        </p>

        {errorMsg && (
          <div className="alert alert-danger">{errorMsg}</div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
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
              placeholder="Your password"
              required
            />
          </div>

          <button className="btn btn-primary w-100 mb-3">
            Login
          </button>
        </form>

        <div className="text-center mt-3">
          <span className="small text-muted">
            New organization?
          </span>
          <a href="/register" className="ms-1">
            Register here
          </a>
        </div>
      </div>
    </div>
  </div>
);

}

export default Login;
