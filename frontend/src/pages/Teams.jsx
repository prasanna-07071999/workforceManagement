import React, { useState, useEffect, useCallback } from "react"
import { BASE_URL } from "../services/api";
import { useHistory } from "react-router-dom"
import TeamForm from "../components/TeamForm"
import BackButton from "../components/BackButton";

const Teams = () => {
    const history = useHistory()
    const [teams, setTeams] = useState([])
    const [errorMsg, setErrorMsg] = useState("")
    const [successMsg, setSuccessMsg] = useState("")
    const [showForm, setShowForm] = useState(false)
    const [selectedTeam, setSelectedTeam] = useState(null)
    const token = localStorage.getItem("jwt");
    
    const fetchTeams = useCallback(async () => {
        try {
            const url = `${BASE_URL}/api/teams`
            const options = {
                headers: { Authorization: `Bearer ${token}` }
            }

            const response = await fetch(url, options)
            const data = await response.json()

            if (!response.ok) {
                setErrorMsg(data.message || "Failed to load teams")
                return
            }

            setTeams(data)
        } catch (error) {
            setErrorMsg("Something went wrong")
        }
    }, [token])

    useEffect(() => {fetchTeams()}, [fetchTeams])

    const handleAddClick = () => {
        setSelectedTeam(null)
        setShowForm(true)
    }

    const handleEditClick = (team) => {
        setSelectedTeam(team)
        setShowForm(true)
    }

    const handleFormSuccess = () => {
        setShowForm(false)
        fetchTeams()
        setSuccessMsg("Saved successfully!")
    }

    const handleAssignClick = (team) => {
        history.push(`/teams/${team._id}/assign`);
    };

    return (
    <div className="container-fluid mt-4 px-2 px-md-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
            <h2>Teams</h2>
        </div>

        {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}
        {successMsg && <div className="alert alert-success">{successMsg}</div>}

        <button className="btn btn-primary mb-3" onClick={handleAddClick}>
            Add Team
        </button>

        <div className="card p-3 shadow">
        <div className="table-responsive">
            <table className="table table-bordered mb-0">
            <thead className="table-light">
                <tr>
                <th className="d-none d-md-table-cell">ID</th>
                <th>Name</th>
                <th>Description</th>
                <th style={{ width: "180px" }}>Action</th>
                </tr>
            </thead>
            <tbody>
                {teams.map((team) => (
                <tr key={team._id}>
                    <td className="d-none d-md-table-cell">{team._id}</td>
                    <td>{team.name}</td>
                    <td>{team.description}</td>
                    <td>
                    <div className="d-flex flex-column flex-md-row gap-2">
                        <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => handleEditClick(team)}
                        >
                        Edit
                        </button>
                        <button
                        className="btn btn-sm btn-info"
                        onClick={() => handleAssignClick(team)}
                        >
                        Assign
                        </button>
                    </div>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>

        <BackButton />
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

}

export default Teams
