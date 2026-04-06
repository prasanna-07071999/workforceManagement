import React, { useEffect, useState } from "react";
import BackButton from "../components/BackButton";
import { BASE_URL } from "../services/api";

const Recruitment = () => {
  const token = localStorage.getItem("jwt");

  const [jobs, setJobs] = useState([]);

  const [form, setForm] = useState({
    title: "",
    requiredSkills: "",
    qualifications: "",
    startDate: "",
    deadline: ""
  });

  const fetchJobs = async () => {
    const res = await fetch(`${BASE_URL}/api/recruitment/jobs`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setJobs(data);
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreateJob = async () => {
    const payload = {
      ...form,
      requiredSkills: form.requiredSkills.split(",").map(s => s.trim())
    };

    await fetch(`${BASE_URL}/api/recruitment/jobs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    setForm({
      title: "",
      requiredSkills: "",
      qualifications: "",
      startDate: "",
      deadline: ""
    });

    fetchJobs();
  };

  return (
    <div className="container-fluid px-2 px-md-4">

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold mb-3">Recruitment</h4>
        <BackButton />
      </div>

      {/* Create Job */}
      <div className="card p-3 p-md-4 mb-4">
        <h6>Create Job Posting</h6>

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
          className="btn btn-primary btn-sm w-100 w-md-auto"
        >
          Post Job
        </button>
      </div>

      {/* Job List */}
      <div className="card p-3 p-md-4">
        <h6>Job Postings</h6>

        {jobs.length === 0 ? (
          <p className="text-muted small">No jobs created yet</p>
        ) : (
          jobs.map((job) => (
            <div key={job._id} className="border rounded p-3 mb-3">

              <h6 className="fw-bold">{job.title}</h6>

              <p className="mb-1">
                <strong>Skills:</strong> {job.requiredSkills?.join(", ")}
              </p>

              <p className="mb-1">
                <strong>Qualifications:</strong> {job.qualifications}
              </p>

              <p className="mb-1">
                <strong>Start Date:</strong> {job.startDate?.slice(0,10)}
              </p>

              <p className="mb-1">
                <strong>Deadline:</strong> {job.deadline?.slice(0,10)}
              </p>

              <span className="badge bg-info">
                Applications: {job.applicationsCount || 0}
              </span>

            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default Recruitment