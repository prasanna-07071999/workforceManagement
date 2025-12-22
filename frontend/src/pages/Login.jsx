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
        <div>
            <h1 className="text-primary text-center pt-5">Human Resourse Management System</h1>
            <div className="container  pt-5 d-flex flex-row justify-content-center">
                <div className="col-6 p-3">
                    <h1>Welcome to the HR Management System</h1>
                    <p className="text-secondary">
                        Our HR Management System is designed to simplify workforce operations and empower 
                        both employees and managers. With intuitive tools for onboarding, team management, 
                        attendance tracking, and more, HRMS helps your organization run smoothly while keeping 
                        all your HR data secure and accessible in one place.
                    </p>
                </div>
                <div className="card p-4 shadow col-6 mt-0">
                    <h1 className="text-center mb-4">Login</h1>

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
                                onChange={(event) => setEmail(event.target.value)}
                                required 
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Password</label>
                            <input 
                                type="password"
                                className="form-control"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                required 
                            />
                        </div>
                        <div>
                            <button className="btn btn-primary w-100" type="submit">
                                Login
                            </button>
                        </div>
                    </form>
                   <div className="text-center mt-2">
                        <p className="fw-bold btn btn-outline-dark">
                            Don't have an account? <a href="/register" className="text-primary">Register</a>
                        </p>
                    </div>
                </div>
        </div>
    </div>
        
    )
}

export default Login;
