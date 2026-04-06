import React, { useEffect, useState, useCallback } from "react";
import BackButton from "../components/BackButton";
import { BASE_URL } from "../services/api";
import { getAuthState } from "../utils/auth";

const DailyUpdates = () => {
  const token = localStorage.getItem("jwt");
  const isAdmin = getAuthState()?.isAdmin;

  const [description, setDescription] = useState("");
  const [myUpdates, setMyUpdates] = useState([]);

  const [adminData, setAdminData] = useState(null);

  const fetchMyUpdates = useCallback(async () => {
    const res = await fetch(`${BASE_URL}/api/daily-updates/my`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setMyUpdates(await res.json());
  }, [token]);

  const fetchAdminData = useCallback(async () => {
    const res = await fetch(`${BASE_URL}/api/daily-updates`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setAdminData(await res.json());
  }, [token]);

  useEffect(() => {
    if (isAdmin) fetchAdminData();
    else fetchMyUpdates();
  }, [isAdmin, fetchAdminData, fetchMyUpdates]);

  const submitUpdate = async () => {
    await fetch(`${BASE_URL}/api/daily-updates`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ description })
    });
    setDescription("");
    fetchMyUpdates();
  };

  return (
    <div className="container-fluid px-2 px-md-4">

      <div className="d-flex justify-content-between mb-3">
        <h4 className="fw-bold">Daily Updates</h4>
        <BackButton />
      </div>

      {/* EMPLOYEE VIEW */}
      {!isAdmin && (
        <>
          <div className="card p-3 mb-3">
            <h6>Submit Daily Update</h6>

            <textarea
              className="form-control mb-2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What did you work on today?"
            />

            <button className="btn btn-primary" onClick={submitUpdate}>
              Submit
            </button>
          </div>

          <div className="card p-3">
            <h6>My Updates</h6>

            {myUpdates.map(u => (
              <div key={u._id} className="border p-2 mb-2">
                <b>{u.date}</b>
                <div>{u.description}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ADMIN VIEW */}
      {isAdmin && adminData && (
        <>
          {/* SUMMARY */}
          <div className="row mb-3">
            <Card title="Total Employees" value={adminData.summary.totalEmployees} />
            <Card title="Submitted Today" value={adminData.summary.submitted} />
            <Card title="Missing" value={adminData.summary.missing} />
          </div>

          {/* MISSING */}
          <div className="card p-3 mb-3">
            <h6>Missing Updates Today</h6>

            {adminData.missingEmployees.length === 0 ? (
              <p className="text-success">All submitted 🎉</p>
            ) : (
              adminData.missingEmployees.map((e, i) => (
                <div key={i}>
                  {e.name} ({e.email})
                </div>
              ))
            )}
          </div>

          {/* ALL UPDATES */}
          <div className="card p-3">
            <h6>All Updates</h6>

            {adminData.updates.map(u => (
              <div key={u._id} className="border p-2 mb-2">
                <b>{u.userId?.name}</b> ({u.userId?.email})
                <div>{u.date}</div>
                <div>{u.description}</div>
              </div>
            ))}
          </div>
        </>
      )}

    </div>
  );
};

const Card = ({ title, value }) => (
  <div className="col-md-4 mb-2">
    <div className="card p-3 text-center">
      <h6>{title}</h6>
      <h4>{value}</h4>
    </div>
  </div>
);

export default DailyUpdates