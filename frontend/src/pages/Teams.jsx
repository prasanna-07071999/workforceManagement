import React, { useState, useEffect, useCallback } from "react";
import { BASE_URL } from "../services/api";
import { useHistory } from "react-router-dom";
import TeamForm from "../components/TeamForm";
import BackButton from "../components/BackButton";

const Teams = () => {
    const history = useHistory();
    const [teams, setTeams] = useState([]);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const token = localStorage.getItem("jwt");

    const fetchTeams = useCallback(async () => {
        try {
            const response = await fetch(`${BASE_URL}/api/teams`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();

            if (!response.ok) {
                setErrorMsg(data.message || "Failed to load teams");
                return;
            }

            setTeams(data);
        } catch {
            setErrorMsg("Something went wrong");
        }
    }, [token]);

    useEffect(() => {
        fetchTeams();
    }, [fetchTeams]);

    const handleAddClick = () => {
        setSelectedTeam(null);
        setShowForm(true);
    };

    const handleEditClick = (team) => {
        setSelectedTeam(team);
        setShowForm(true);
    };

    const handleAssignClick = (team) => {
        history.push(`/teams/${team._id}/assign`);
    };

    const handleDeleteTeam = async (id) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this team?"
        );
        if (!confirmDelete) return;

        try {
            const response = await fetch(`${BASE_URL}/api/teams/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (!response.ok) {
                setErrorMsg(data.message || "Failed to delete team");
                return;
            }

            setSuccessMsg("Team deleted successfully");
            fetchTeams();
        } catch {
            setErrorMsg("Something went wrong while deleting team");
        }
    };

    const handleFormSuccess = () => {
        setShowForm(false);
        fetchTeams();
        setSuccessMsg("Saved successfully!");
    };

    return (
        <div className="container-fluid mt-4 px-2 px-md-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="mb-0">Teams</h2>
            </div>

            {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}
            {successMsg && <div className="alert alert-success">{successMsg}</div>}

            <div className="d-flex justify-content-between align-items-center mb-3">
                <button className="btn btn-primary" onClick={handleAddClick}>
                    Add Team
                </button>
                <BackButton />
            </div>

            <div className="card shadow-sm p-3">

                {/* ===== Desktop / Tablet Table View ===== */}
                <div className="d-none d-md-block">
                    <div className="table-responsive">
                        <table className="table table-bordered align-middle mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th className="d-none d-lg-table-cell">ID</th>
                                    <th>Name</th>
                                    <th>Description</th>
                                    <th style={{ width: "240px" }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {teams.map((team) => (
                                    <tr key={team._id}>
                                        <td className="d-none d-lg-table-cell">
                                            {team._id}
                                        </td>
                                        <td>{team.name}</td>
                                        <td>{team.description || "-"}</td>
                                        <td>
                                            <div className="d-flex flex-column flex-lg-row gap-1 gap-lg-2">
                                                <button
                                                    className="btn btn-sm btn-secondary py-1 px-2 py-lg-2 px-lg-3"
                                                    onClick={() => handleEditClick(team)}
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    className="btn btn-sm btn-info py-1 px-2 py-lg-2 px-lg-3"
                                                    onClick={() => handleAssignClick(team)}
                                                >
                                                    Assign
                                                </button>

                                                <button
                                                    className="btn btn-sm btn-danger py-1 px-2 py-lg-2 px-lg-3"
                                                    onClick={() => handleDeleteTeam(team._id)}
                                                >
                                                    <span className="d-lg-none">Del</span>
                                                    <span className="d-none d-lg-inline">
                                                        Delete
                                                    </span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {teams.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan="4"
                                            className="text-center text-muted py-4"
                                        >
                                            No teams found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ===== Mobile Card View ===== */}
                <div className="d-md-none">
                    {teams.map((team) => (
                        <div key={team._id} className="card mb-3 shadow-sm">
                            <div className="card-body">
                                <h5 className="card-title mb-1">
                                    {team.name}
                                </h5>
                                <p className="card-text text-muted small mb-3">
                                    {team.description || "No description"}
                                </p>

                                <div className="d-flex gap-2">
                                    <button
                                        className="btn btn-sm btn-secondary flex-fill"
                                        onClick={() => handleEditClick(team)}
                                    >
                                        Edit
                                    </button>

                                    <button
                                        className="btn btn-sm btn-info flex-fill"
                                        onClick={() => handleAssignClick(team)}
                                    >
                                        Assign
                                    </button>

                                    <button
                                        className="btn btn-sm btn-danger flex-fill"
                                        onClick={() => handleDeleteTeam(team._id)}
                                    >
                                        Del
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {teams.length === 0 && (
                        <div className="text-center text-muted py-4">
                            No teams found
                        </div>
                    )}
                </div>
            </div>

            {showForm && (
                <TeamForm
                    selectedTeam={selectedTeam}
                    onSuccess={handleFormSuccess}
                    onCancel={() => setShowForm(false)}
                />
            )}
        </div>
    );
};

export default Teams