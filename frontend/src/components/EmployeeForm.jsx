import React, { useState, useEffect } from "react";
import { BASE_URL } from "../services/api";

const EmployeeForm = ({ selectedEmployee, onSuccess, onCancel }) => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (selectedEmployee) {
        setFirstName(selectedEmployee.firstName);
        setLastName(selectedEmployee.lastName);
        setEmail(selectedEmployee.email);
        setPhone(selectedEmployee.phone);
        }
    }, [selectedEmployee]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setErrorMsg("");
        try {
        const token = localStorage.getItem("jwt");
        const url = selectedEmployee
            ? `${BASE_URL}/api/employees/${selectedEmployee._id}`
            : `${BASE_URL}/api/employees`;

        const method = selectedEmployee ? "PUT" : "POST";

        const response = await fetch(url, {
            method,
            headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                firstName,
                lastName,
                email,
                phone
            })
        });
        console.log(response)
        const data = await response.json();

        if (!response.ok) {
            setErrorMsg(data.message || "Something went wrong");
            setLoading(false);
            return;
        }

        onSuccess();
        } catch (error) {
        setErrorMsg("Failed to submit form");
        }

        setLoading(false);
    };

    return (
        <div className="card shadow p-4 mt-3">
        <h4 className="mb-3">
            {selectedEmployee ? "Edit Employee" : "Add Employee"}
        </h4>
        {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}
        <form onSubmit={handleSubmit}>
            <div className="row">
            <div className="mb-3 col-md-6">
                <label className="form-label">First Name</label>
                <input
                type="text"
                className="form-control"
                value={firstName || ""}
                onChange={(e) => setFirstName(e.target.value)}
                required
                />
            </div>
            <div className="mb-3 col-md-6">
                <label className="form-label">Last Name</label>
                <input
                type="text"
                className="form-control"
                value={lastName|| ""}
                onChange={(e) => setLastName(e.target.value)}
                required
                />
            </div>
            </div>
            <div className="mb-3">
            <label className="form-label">Email</label>
            <input
                type="email"
                className="form-control"
                value={email || ''}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
            </div>
            <div className="mb-3">
            <label className="form-label">Phone</label>
            <input
                type="text"
                className="form-control"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
            />
            </div>
            <div className="d-flex justify-content-between">
            <button className="btn btn-secondary" type="button" onClick={onCancel}>
                Cancel
            </button>
            <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? "Saving..." : "Submit"}
            </button>
            </div>
        </form>
        </div>
  );
};

export default EmployeeForm