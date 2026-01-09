import React, { useState, useEffect, useCallback } from "react";
import { BASE_URL } from "../services/api";
import EmployeeForm from "../components/EmployeeForm";
import BackButton from "../components/BackButton";

const Employees = () => {
    const [employees, setEmployees] = useState([]);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const token = localStorage.getItem("jwt");

    const fetchEmployees = useCallback(async () => {
        try {
        const url = `${BASE_URL}/api/employees`;
        const options = {
            headers: { Authorization: `Bearer ${token}` }
        };
        const response = await fetch(url, options);
        const data = await response.json();
        if (!response.ok) {
            setErrorMsg(data.message || "Failed to load employees");
            return;
        }
        setEmployees(data);
        } catch (error) {
        setErrorMsg("Something went wrong");
        }
    }, [token]);

    useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

    const handleAddClick = () => {
        setSelectedEmployee(null);
        setShowForm(true);
    };

    const handleEditClick = (emp) => {
        setSelectedEmployee(emp);
        setShowForm(true);
    };

    const handleFormSuccess = () => {
        setShowForm(false);
        fetchEmployees();
        setSuccessMsg("Saved successfully!");
    };

    return (
    <div className="container-fluid mt-4 px-2 px-md-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
            <h1>Employees</h1>
        </div>

        {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}
        {successMsg && <div className="alert alert-success">{successMsg}</div>}

        <button className="btn btn-primary mb-3" onClick={handleAddClick}>
        Add Employee
        </button>

        <div className="card p-3 shadow">
        <div className="table-responsive">
            <table className="table table-bordered mb-0">
            <thead className="table-light">
                <tr>
                <th className="d-none d-md-table-cell">ID</th>
                <th>Full Name</th>
                <th>Email</th>
                <th className="d-none d-lg-table-cell">Phone</th>
                <th style={{ width: "120px" }}>Action</th>
                </tr>
            </thead>
            <tbody>
                {employees.map((emp) => (
                <tr key={emp._id}>
                    <td className="d-none d-md-table-cell">{emp._id}</td>
                    <td>{emp.firstName} {emp.lastName}</td>
                    <td className="text-break">{emp.email}</td>
                    <td className="d-none d-lg-table-cell">{emp.phone}</td>
                    <td>
                    <button
                        className="btn btn-sm btn-secondary w-100 w-md-auto"
                        onClick={() => handleEditClick(emp)}
                    >
                        Edit
                    </button>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>

        <BackButton />
        </div>

        {showForm && (
        <EmployeeForm
            selectedEmployee={selectedEmployee}
            onSuccess={handleFormSuccess}
            onCancel={() => setShowForm(false)}
        />
        )}
    </div>
    );

};

export default Employees