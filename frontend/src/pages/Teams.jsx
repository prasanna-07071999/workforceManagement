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
    console.log("JWT in Teams page:", token);
    
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
            console.log("TEAM RESPONSE:", response.status, data);
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
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Teams</h2>
            </div>

            {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}
            {successMsg && <div className="alert alert-success">{successMsg}</div>}

            <button className="btn btn-primary mb-3" onClick={handleAddClick}>
                Add Team
            </button>

            <div className="card p-3 shadow">
                <table className="table table-bordered">
                    <thead className="table-light">
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Description</th>
                            <th style={{ width: "180px" }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {teams.map((team) => (
                            <tr key={team._id}>
                                <td>{team._id}</td>
                                <td>{team.name}</td>
                                <td>{team.description}</td>
                                <td>
                                    <button
                                        className="btn btn-sm btn-secondary me-3"
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
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
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
    )
}

export default Teams
