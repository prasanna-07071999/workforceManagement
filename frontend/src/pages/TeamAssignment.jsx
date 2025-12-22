import React, { useEffect, useState, useCallback } from "react";
import BackButton from "../components/BackButton";
import { BASE_URL } from "../services/api";

const TeamAssignment = (props) => {
  const teamId = props.match.params.teamId;
  console.log("TEAM ID:", teamId)
  const [employees, setEmployees] = useState([]);     // All employees
  const [teamEmployees, setTeamEmployees] = useState([]); // Employees assigned to this team

  const [selectedAssign, setSelectedAssign] = useState([]);
  const [selectedUnassign, setSelectedUnassign] = useState([]);

  const token = localStorage.getItem("jwt");

  /** Fetch all employees */
  const fetchEmployees = useCallback(async () => {
    const response = await fetch(`${BASE_URL}/api/employees`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    const normalized = data.map(emp => ({
      ...emp,
      id: emp.id || emp._id
    }));
    setEmployees(normalized);
  }, [token]);

  /** Fetch team details */
  const fetchTeamDetails = useCallback(async () => {
    const res = await fetch(`${BASE_URL}/api/teams/${teamId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setTeamEmployees(data.employees || []);
  }, [teamId, token]);

  // Load on mount
  useEffect(() => {
    fetchEmployees();
    fetchTeamDetails();
  }, [fetchEmployees, fetchTeamDetails]);

  /**
   * ASSIGN MULTIPLE EMPLOYEES
   */
  const handleAssign = async () => {
    if (selectedAssign.length === 0) {
      alert("Select employee(s) to assign.");
      return;
    }

    await fetch(`${BASE_URL}/api/teams/${teamId}/assign`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ employeeIds: selectedAssign }),
    });

    // Update UI instantly
    const newlyAssigned = employees.filter((e) =>
      selectedAssign.includes(e.id)
    );

    setTeamEmployees([...teamEmployees, ...newlyAssigned]);

    setSelectedAssign([]);
  };

  /**
   * UNASSIGN ONE BY ONE (API supports only single unassign)
   */
  const handleUnassign = async () => {
    if (selectedUnassign.length === 0) {
      alert("Select employee to unassign.");
      return;
    }

    const employeeId = selectedUnassign[0];

    await fetch(`${BASE_URL}/api/teams/${teamId}/unassign`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ employeeId }),
    });

    // Remove from assigned list in UI
    setTeamEmployees(teamEmployees.filter((e) => e.id !== employeeId));

    setSelectedUnassign([]);
  };

  // IDs of assigned employees
  const assignedIds = teamEmployees.map((e) => e.id);

  // Available = employees not assigned
  const availableEmployees = employees.filter(
    (e) => !assignedIds.includes(e.id)
  );
  

  return (
    <div className="container mt-4">
      <h2 className="mb-3">Assign Employees to Team: {teamId}</h2>

      <div className="mb-3 d-flex flex-row justify-content-between">
        <div>
          <button
            className="btn btn-primary me-2"
            onClick={() => props.history.push("/employees")}
          >
            Employees
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => props.history.push("/teams")}
          >
            Teams
          </button>
        </div>

        <BackButton />
      </div>

      <div className="row mt-4">
        {/* AVAILABLE EMPLOYEES */}
        <div className="col-md-6">
          <h4>Available Employees</h4>
          <div className="border p-3" style={{ minHeight: "250px" }}>
            {availableEmployees.map((emp) => (
              <div className="form-check" key={emp.id}>
                {console.log("EMP OBJECT:", emp)}
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={selectedAssign.includes(emp.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedAssign([...selectedAssign, emp.id]);
                    } else {
                      setSelectedAssign(
                        selectedAssign.filter((id) => id !== emp.id)
                      );
                    }
                  }}
                />
                <label className="form-check-label">
                  {emp.firstName} {emp.lastName} ({emp.email})
                </label>
              </div>
            ))}
          </div>
          <button onClick={handleAssign} className="btn btn-success mt-3">
            Assign Selected
          </button>
        </div>

        {/* ASSIGNED EMPLOYEES */}
        <div className="col-md-6">
          <h4>Assigned Employees</h4>
          <div className="border p-3" style={{ minHeight: "250px" }}>
            {teamEmployees.length === 0 && <p>No employees assigned.</p>}

            {teamEmployees.map((emp) => (
              <div className="form-check" key={emp.id}>
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={selectedUnassign.includes(emp.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedUnassign([emp.id]);
                    } else {
                      setSelectedUnassign([]);
                    }
                  }}
                />
                <label className="form-check-label">
                  {emp.firstName} {emp.lastName} ({emp.email})
                </label>  
              </div>
            ))}
          </div>

          <button onClick={handleUnassign} className="btn btn-danger mt-3">
            Unassign Selected
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamAssignment
