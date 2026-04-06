import React, { useEffect, useState, useCallback } from "react";
import { BASE_URL } from "../services/api";
import BackButton from "../components/BackButton";
import ProjectForm from "../components/ProjectForm";
import { getAuthState } from "../utils/auth";

const Projects = () => {
  const token = localStorage.getItem("jwt");
  const auth = getAuthState();
  const isAdmin = auth?.isAdmin;

  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);

  const [activeProjects, setActiveProjects] = useState([]);
  const [completedProjects, setCompletedProjects] = useState([]);

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [viewProject, setViewProject] = useState(null);

  /* ================= FETCH PROJECTS ================= */

  const fetchProjects = useCallback(async () => {
    if (!token) return;

    setErrorMsg("");
    setSuccessMsg("");

    const url = isAdmin
      ? `${BASE_URL}/api/projects`
      : `${BASE_URL}/api/projects/my`;

    try {
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();
      console.log(data)
      if (!response.ok) {
        setErrorMsg(data.message || "Failed to load projects");
        return;
      }

      if (isAdmin) {
        setProjects(data);
      } else {
        const active = data.filter( p => p.status === "Active" || p.status === "Upcoming");
        const completed = data.filter(p => p.status === "Completed");

        setActiveProjects(active);
        setCompletedProjects(completed);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Something went wrong while loading projects");
    }
  }, [token, isAdmin]);

  /* ================= FETCH TEAMS (ADMIN ONLY) ================= */

  const fetchTeams = useCallback(async () => {
    if (!token || !isAdmin) return;

    try {
      const response = await fetch(`${BASE_URL}/api/teams`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();
      if (response.ok) setTeams(data);
    } catch (err) {
      console.error(err);
    }
  }, [token, isAdmin]);

  useEffect(() => {
    fetchProjects();
    fetchTeams();
  }, [fetchProjects, fetchTeams]);

  /* ================= ADMIN HANDLERS ================= */

  const handleCreateOrUpdate = async (formData) => {
    const isEdit = !!editProject;

    const url = isEdit
      ? `${BASE_URL}/api/projects/${editProject._id}`
      : `${BASE_URL}/api/projects`;

    const method = isEdit ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (!response.ok) {
        setErrorMsg(data.message || "Operation failed");
        return;
      }

      setSuccessMsg(isEdit ? "Project updated successfully" : "Project created successfully");
      setShowForm(false);
      setEditProject(null);
      fetchProjects();
    } catch (err) {
      console.error(err);
      setErrorMsg("Something went wrong");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this project?")) return;

    try {
      const response = await fetch(`${BASE_URL}/api/projects/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();
      if (!response.ok) {
        setErrorMsg(data.message || "Delete failed");
        return;
      }

      setSuccessMsg("Project deleted successfully");
      fetchProjects();
    } catch (err) {
      console.error(err);
      setErrorMsg("Something went wrong");
    }
  };

  /* ================= COMMON ================= */

  const openDetails = async (id) => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/projects/${id}/details`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await response.json();
      if (response.ok) setViewProject(data);
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="container-fluid mt-4 px-2 px-md-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold">
          {isAdmin ? "Projects" : "My Projects"}
        </h4>
        <BackButton />
      </div>

      {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      {/* ================= ADMIN FORM ================= */}
      {isAdmin && showForm && (
        <ProjectForm
          teams={teams}
          initialData={editProject}
          onSubmit={handleCreateOrUpdate}
          onCancel={() => {
            setShowForm(false);
            setEditProject(null);
          }}
        />
      )}

      {isAdmin && !showForm && (
        <button
          className="btn btn-primary btn-sm mb-3"
          onClick={() => setShowForm(true)}
        >
          Create Project
        </button>
      )}

      {/* ================= ADMIN VIEW ================= */}
      {isAdmin && (
        <div className="card p-3 shadow-sm">
          <h6>All Projects</h6>

          <div className="table-responsive d-none d-md-block">
            <table className="table table-bordered align-middle">
              <thead className="table-light">
                <tr>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Team</th>
                  <th style={{ width: "220px" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => (
                  <tr key={p._id}>
                    <td>{p.name}</td>
                    <td>{p.status}</td>
                    <td>{p.teamId?.name || "-"}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <button className="btn btn-sm btn-info" onClick={() => openDetails(p._id)}>
                          View
                        </button>
                        <button className="btn btn-sm btn-secondary" onClick={() => {
                          setEditProject(p);
                          setShowForm(true);
                        }}>
                          Edit
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p._id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {projects.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center text-muted">
                      No projects found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= EMPLOYEE VIEW ================= */}
      {!isAdmin && (
        <>
          <div className="card p-3 shadow-sm mb-3">
            <h6>Active Projects</h6>
            {activeProjects.length === 0 ? (
              <p className="text-muted small">No active projects</p>
            ) : (
              activeProjects.map(p => (
                <div key={p._id} className="border rounded p-2 mb-2">
                  <strong>{p.name}</strong>
                  <p className="small mb-1">Status: {p.status}</p>
                  <button className="btn btn-sm btn-info" onClick={() => openDetails(p._id)}>
                    View Details
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="card p-3 shadow-sm">
            <h6>Completed Projects</h6>
            {completedProjects.length === 0 ? (
              <p className="text-muted small">No completed projects</p>
            ) : (
              completedProjects.map(p => (
                <div key={p._id} className="border rounded p-2 mb-2">
                  <strong>{p.name}</strong>
                  <p className="small mb-1">Status: {p.status}</p>
                  <button className="btn btn-sm btn-info" onClick={() => openDetails(p._id)}>
                    View Details
                  </button>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* ================= DETAILS MODAL ================= */}
      {viewProject && (
        <div className="modal d-block bg-dark bg-opacity-50">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5>{viewProject.project.name}</h5>
                <button className="btn-close" onClick={() => setViewProject(null)} />
              </div>
              <div className="modal-body">
                <p>{viewProject.project.description}</p>
                <p>Status: {viewProject.project.status}</p>
                <p>Team: {viewProject.project.teamId?.name || "-"}</p>

                <h6>Team Members</h6>
                <ul>
                  {viewProject.teamMembers.map(m => (
                    <li key={m._id}>
                      {m.employeeId.firstName} {m.employeeId.lastName}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;