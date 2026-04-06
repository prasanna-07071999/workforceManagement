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
            const response = await fetch(`${BASE_URL}/api/employees`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (!response.ok) {
                setErrorMsg(data.message || "Failed to load employees");
                return;
            }
            setEmployees(data);
        } catch {
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

    const handleDeleteClick = async (id) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this employee?"
        );
        if (!confirmDelete) return;

        try {
            const response = await fetch(`${BASE_URL}/api/employees/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (!response.ok) {
                setErrorMsg(data.message || "Delete failed");
                return;
            }

            setSuccessMsg("Employee deleted successfully");
            fetchEmployees();
        } catch {
            setErrorMsg("Something went wrong while deleting");
        }
    };

    const handleFormSuccess = () => {
        setShowForm(false);
        fetchEmployees();
        setSuccessMsg("Saved successfully!");
    };

    return (
        <div className="container-fluid mt-4 px-2 px-md-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h1 className="mb-0">Employees</h1>
            </div>

            {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}
            {successMsg && <div className="alert alert-success">{successMsg}</div>}

            <div className="d-flex justify-content-between align-items-center mb-3">
                <button className="btn btn-primary" onClick={handleAddClick}>
                    Add Employee
                </button>
                <BackButton />
            </div>

            <div className="card shadow-sm">
                <div className="table-responsive">
                    <table className="table table-bordered align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th className="d-none d-md-table-cell">ID</th>
                                <th>Full Name</th>
                                <th>Email</th>
                                <th
                                    className="d-none d-lg-table-cell"
                                    style={{ width: "120px" }}
                                >
                                    Phone
                                </th>
                                <th className="text-center" style={{ width: "auto" }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map((emp) => (
                                <tr key={emp._id}>
                                    <td className="d-none d-md-table-cell">
                                        {emp._id}
                                    </td>
                                    <td>{emp.firstName} {emp.lastName}</td>
                                    <td className="text-break">{emp.email}</td>
                                    <td className="d-none d-lg-table-cell">
                                        {emp.phone || "-"}
                                    </td>
                                    <td className="text-center">
                                        <div className="d-flex flex-column flex-md-row gap-1 gap-md-2">
                                            
                                            {/* Edit Button */}
                                            <button
                                            className="btn btn-sm btn-secondary py-1 px-2 py-md-2 px-md-3"
                                            onClick={() => handleEditClick(emp)}
                                            >
                                            Edit
                                            </button>

                                            {/* Delete Button */}
                                            <button
                                            className="btn btn-sm btn-danger py-1 px-2 py-md-2 px-md-3"
                                            onClick={() => handleDeleteClick(emp._id)}
                                            >
                                            <span className="d-md-none">Del</span>
                                            <span className="d-none d-md-inline">Delete</span>
                                            </button>

                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {employees.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="text-center text-muted py-4">
                                        No employees found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
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