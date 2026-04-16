import React, { useEffect, useState } from "react";
import BackButton from "../components/BackButton";
import { BASE_URL } from "../services/api";

const Recruitment = () => {
  const token = localStorage.getItem("jwt");

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);

  const [editId, setEditId] = useState(null); // ✅ NEW

  const [form, setForm] = useState({
    title: "",
    requiredSkills: "",
    qualifications: "",
    startDate: "",
    deadline: ""
  });

  /* ================= FETCH JOBS ================= */
  useEffect(() => {
    let isMounted = true;

    const fetchJobs = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/recruitment/jobs`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();

        if (isMounted) {
          setJobs(data);
        }
      } catch (err) {
        console.error("Failed to fetch jobs");
      }
    };

    fetchJobs();

    return () => {
      isMounted = false;
    };
  }, [token]);

  /* ================= FORM CHANGE ================= */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ================= CREATE / UPDATE JOB ================= */
  const handleCreateJob = async () => {
    if (!form.title) {
      alert("Job title is required");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...form,
        requiredSkills: form.requiredSkills
          ? form.requiredSkills.split(",").map((s) => s.trim())
          : []
      };

      const url = editId
        ? `${BASE_URL}/api/recruitment/jobs/${editId}`
        : `${BASE_URL}/api/recruitment/jobs`;

      const method = editId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to save job");
        return;
      }

      // reset
      setEditId(null);
      setForm({
        title: "",
        requiredSkills: "",
        qualifications: "",
        startDate: "",
        deadline: ""
      });

      // refresh
      const updated = await fetch(`${BASE_URL}/api/recruitment/jobs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const updatedJobs = await updated.json();
      setJobs(updatedJobs);

    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= EDIT ================= */
  const handleEdit = (job) => {
    setEditId(job._id);

    setForm({
      title: job.title,
      requiredSkills: job.requiredSkills?.join(", ") || "", // ✅ FIX
      qualifications: job.qualifications,
      startDate: job.startDate?.slice(0, 10),
      deadline: job.deadline?.slice(0, 10)
    });
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this job?")) return;

    try {
      await fetch(`${BASE_URL}/api/recruitment/jobs/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      setJobs((prev) => prev.filter((j) => j._id !== id));
    } catch (err) {
      console.error("Delete failed");
    }
  };

  /* ================= STATUS TOGGLE ================= */
  const toggleStatus = async (job) => {
    const newStatus = job.status === "Open" ? "Closed" : "Open";

    try {
      await fetch(`${BASE_URL}/api/recruitment/jobs/${job._id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      setJobs((prev) =>
        prev.map((j) =>
          j._id === job._id ? { ...j, status: newStatus } : j
        )
      );
    } catch (err) {
      console.error("Status update failed");
    }
  };

  return (
    <div className="container-fluid px-2 px-md-4">

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold mb-3">Recruitment</h4>
        <BackButton />
      </div>

      {/* CREATE JOB */}
      <div className="card p-3 p-md-4 mb-4">
        <h6>{editId ? "Edit Job" : "Create Job Posting"}</h6>

        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          className="form-control mb-2"
          placeholder="Job title"
        />

        <input
          name="requiredSkills"
          value={form.requiredSkills}
          onChange={handleChange}
          className="form-control mb-2"
          placeholder="Skills (comma separated)"
        />

        <input
          name="qualifications"
          value={form.qualifications}
          onChange={handleChange}
          className="form-control mb-2"
          placeholder="Qualifications"
        />

        <input
          type="date"
          name="startDate"
          value={form.startDate}
          onChange={handleChange}
          className="form-control mb-2"
        />

        <input
          type="date"
          name="deadline"
          value={form.deadline}
          onChange={handleChange}
          className="form-control mb-2"
        />

        <button
          onClick={handleCreateJob}
          disabled={loading}
          className="btn btn-primary btn-sm w-100 w-md-auto"
        >
          {loading ? "Saving..." : editId ? "Update Job" : "Post Job"}
        </button>
      </div>

      {/* JOB LIST */}
      <div className="card p-3 p-md-4">
        <h6>Job Postings</h6>

        {jobs.length === 0 ? (
          <p className="text-muted small">No jobs created yet</p>
        ) : (
          jobs.map((job) => (
            <div key={job._id} className="border rounded p-3 mb-3">

              <h6 className="fw-bold">{job.title}</h6>

              <p className="mb-1">
                <strong>Skills:</strong> {job.requiredSkills?.join(", ") || "N/A"}
              </p>

              <p className="mb-1">
                <strong>Qualifications:</strong> {job.qualifications}
              </p>

              <p className="mb-1">
                <strong>Start Date:</strong> {job.startDate?.slice(0, 10)}
              </p>

              <p className="mb-1">
                <strong>Deadline:</strong> {job.deadline?.slice(0, 10)}
              </p>

              <p className="mb-1">
                <strong>Status:</strong> {job.status}
              </p>

              <span className="badge bg-info">
                Applications: {job.applicationsCount || 0}
              </span>

              {/* ACTION BUTTONS */}
              <div className="mt-2 d-flex gap-2 flex-wrap">

                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => handleEdit(job)}
                >
                  Edit
                </button>

                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => handleDelete(job._id)}
                >
                  Delete
                </button>

                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => toggleStatus(job)}
                >
                  {job.status === "Open" ? "Close" : "Reopen"}
                </button>

              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default Recruitment; 