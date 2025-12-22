  import React, { useState, useEffect } from "react";
  import { BASE_URL } from "../services/api";

  const TeamForm = ({ selectedTeam, onSuccess, onCancel }) => {
    const [formState, setFormState] = useState({
      name: "",
      description: "",
      errorMsg: "",
      loading: false
    });

    useEffect(() => {
      if (selectedTeam) {
        setFormState(prev => ({
          ...prev,
          name: selectedTeam.name,
          description: selectedTeam.description
        }));
      }
    }, [selectedTeam]);

    const handleChange = (field) => (e) => {
      setFormState(prev => ({
        ...prev,
        [field]: e.target.value
      }));
    };

    const validateForm = () => {
      const errors = {};
      if (!formState.name.trim()) {
        errors.name = "Team name is required";
      }
      if (!formState.description.trim()) {
        errors.description = "Description is required";
      }
      return errors;
    };

    const handleSubmit = async (event) => {
      event.preventDefault();
      const errors = validateForm();
      if (Object.keys(errors).length > 0) {
        setFormState(prev => ({ ...prev, errorMsg: "Please fill in all required fields" }));
        return;
      }
      setFormState(prev => ({ ...prev, loading: true, errorMsg: "" }));
      try {
        const token = localStorage.getItem("jwt");
        const url = selectedTeam
          ? `${BASE_URL}/api/teams/${selectedTeam._id}`
          : `${BASE_URL}/api/teams`;
        const method = selectedTeam ? "PUT" : "POST";
        const response = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ name: formState.name, description: formState.description })
        });
        const data = await response.json();
        if (!response.ok) {
          setFormState(prev => ({
            ...prev,
            errorMsg: data.message || `Failed to save team (Status: ${response.status})`,
            loading: false
          }));
          return;
        }
        onSuccess();
      } catch (error) {
        setFormState(prev => ({
          ...prev,
          errorMsg: "Something went wrong",
          loading: false
        }));
      }
    };

    return (
      <div className="card shadow p-4 mt-3">
        <h4 className="mb-3">
          {selectedTeam ? "Edit Team" : "Add Team"}
        </h4>
        {formState.errorMsg && (
          <div className="alert alert-danger" id="error-msg">
            {formState.errorMsg}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label" htmlFor="teamName">Team Name</label>
            <input
              type="text"
              id="teamName"
              className="form-control"
              value={formState.name}
              onChange={handleChange("name")}
              required
              aria-describedby={formState.errorMsg ? "error-msg" : undefined}
            />
          </div>
          <div className="mb-3">
            <label className="form-label" htmlFor="description">Description</label>
            <textarea
              id="description"
              className="form-control"
              rows="3"
              value={formState.description}
              onChange={handleChange("description")}
              required
              aria-describedby={formState.errorMsg ? "error-msg" : undefined}
            />
          </div>
          <div className="d-flex justify-content-between">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button className="btn btn-primary" type="submit" disabled={formState.loading}>
              {formState.loading ? "Saving..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    );
  };

  export default TeamForm;