import React, { useState, useEffect } from "react";

const ProjectForm = ({
  teams = [],
  initialData,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "Upcoming",
    startDate: "",
    endDate: "",
    teamId: ""
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        description: initialData.description || "",
        status: initialData.status || "Upcoming",
        startDate: initialData.startDate || "",
        endDate: initialData.endDate || "",
        teamId: initialData.teamId?._id || ""
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.teamId) {
      alert("Project name and team are required");
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="card p-3 mb-3 shadow-sm">
      <h6 className="mb-3">
        {initialData ? "Edit Project" : "Create Project"}
      </h6>

      <input
        className="form-control mb-2"
        name="name"
        placeholder="Project Name"
        value={formData.name}
        onChange={handleChange}
      />

      <textarea
        className="form-control mb-2"
        name="description"
        placeholder="Description"
        value={formData.description}
        onChange={handleChange}
      />

      <div className="row">
        <div className="col-md-6 mb-2">
          <select
            className="form-control"
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="Upcoming">Upcoming</option>
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <div className="col-md-6 mb-2">
          <select
            className="form-control"
            name="teamId"
            value={formData.teamId}
            onChange={handleChange}
          >
            <option value="">Select Team</option>
            {teams.map((team) => (
              <option key={team._id} value={team._id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6 mb-2">
          <input
            type="date"
            className="form-control"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
          />
        </div>
        <div className="col-md-6 mb-2">
          <input
            type="date"
            className="form-control"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="d-flex gap-2 mt-2">
        <button className="btn btn-primary btn-sm" onClick={handleSubmit}>
          {initialData ? "Update" : "Create"}
        </button>
        <button className="btn btn-secondary btn-sm" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ProjectForm;