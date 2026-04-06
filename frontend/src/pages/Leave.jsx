import React, { useEffect, useState, useCallback } from "react";
import BackButton from "../components/BackButton";
import { BASE_URL } from "../services/api";
import { getAuthState } from "../utils/auth";

const Leaves = () => {
  const token = localStorage.getItem("jwt");
  const auth = getAuthState();
  const isAdmin = auth?.isAdmin;

  /* ================= COMMON ================= */
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  /* ================= EMPLOYEE STATES ================= */
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reason, setReason] = useState("");
  const [leaveType, setLeaveType] = useState("Casual");
  const [myLeaves, setMyLeaves] = useState([]);

  /* ================= ADMIN STATES ================= */
  const [allLeaves, setAllLeaves] = useState([]);

  /* ================= FETCH MY LEAVES ================= */
    const fetchMyLeaves = useCallback(async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/leaves/my`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        console.log(data)
        setMyLeaves(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      }
    }, [token]);


  /* ================= FETCH ALL LEAVES (ADMIN) ================= */
    const fetchAllLeaves = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/leaves`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setAllLeaves(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  }, [token]);


  /* ================= APPLY LEAVE ================= */
  const applyLeave = async () => {
    try {
      setErrorMsg("");
      setSuccessMsg("");

      const res = await fetch(`${BASE_URL}/api/leaves`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fromDate,
          toDate,
          reason,
          leaveType
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.message || "Failed to apply leave");
        return;
      }

      setSuccessMsg("Leave applied successfully");
      setFromDate("");
      setToDate("");
      setReason("");
      setLeaveType("Casual");

      fetchMyLeaves();
    } catch (err) {
      setErrorMsg("Something went wrong");
    }
  };

  /* ================= UPDATE STATUS (ADMIN) ================= */
  const updateStatus = async (leaveId, status) => {
    try {
      const res = await fetch(
        `${BASE_URL}/api/leaves/${leaveId}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ status })
        }
      );

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Action failed");
        return;
      }

      fetchAllLeaves();
    } catch (err) {
      alert("Failed to update leave");
    }
  };

  /* ================= EFFECTS ================= */
    useEffect(() => {
    if (!token) return;

    if (isAdmin) {
      fetchAllLeaves();
    } else {
      fetchMyLeaves();
    }
  }, [isAdmin, token, fetchAllLeaves, fetchMyLeaves]);


  /* ================= UI ================= */
  return (
    <div className="container-fluid px-2 px-md-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold mb-3">
          {isAdmin ? "Leave Management (Admin)" : "My Leaves"}
        </h4>
        <BackButton />
      </div>

      {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      {/* ================= EMPLOYEE VIEW ================= */}
      {!isAdmin && (
        <>
          {/* APPLY LEAVE */}
          <div className="card p-3 p-md-4 mb-3">
            <h6>Apply Leave</h6>

            <select
              className="form-select mb-2"
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
            >
              <option>Casual</option>
              <option>Sick</option>
              <option>Earned</option>
            </select>

            <input
              type="date"
              className="form-control mb-2"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />

            <input
              type="date"
              className="form-control mb-2"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />

            <textarea
              className="form-control mb-2"
              placeholder="Reason"
              rows="3"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />

            <button
              className="btn btn-primary btn-sm"
              onClick={applyLeave}
            >
              Apply Leave
            </button>
          </div>

          {/* MY LEAVES */}
          <div className="card p-3 p-md-4">
            <h6>My Leave Requests</h6>

            {myLeaves.length === 0 ? (
              <p className="text-muted small">No leave requests</p>
            ) : (
              <ul className="list-group list-group-flush">
                {myLeaves.map((l) => (
                  <li key={l._id} className="list-group-item small">
                    {l.fromDate} → {l.toDate} | {l.leaveType} |{" "}
                    <strong>{l.status}</strong>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}

      {/* ================= ADMIN VIEW ================= */}
      {isAdmin && (
        <div className="card p-3 shadow-sm">
          <h6>All Leave Requests</h6>

          <div className="table-responsive">
            <table className="table table-bordered align-middle">
              <thead className="table-light">
                <tr>
                  <th>Employee</th>
                  <th>Dates</th>
                  <th>Type</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {allLeaves.map((l) => (
                  <tr key={l._id}>
                    <td>
                      {l.userId?.name}
                      <br />
                      <small className="text-muted">
                        {l.userId?.email}
                      </small>
                    </td>
                    <td>
                      {l.fromDate} → {l.toDate}
                    </td>
                    <td>{l.leaveType}</td>
                    <td>{l.reason}</td>
                    <td>
                      <span
                        className={`badge bg-${
                          l.status === "Approved"
                            ? "success"
                            : l.status === "Rejected"
                            ? "danger"
                            : "warning"
                        }`}
                      >
                        {l.status}
                      </span>
                    </td>
                    <td>
                      {l.status === "Pending" && (
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() =>
                              updateStatus(l._id, "Approved")
                            }
                          >
                            Approve
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() =>
                              updateStatus(l._id, "Rejected")
                            }
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {l.status !== "Pending" && "-"}
                    </td>
                  </tr>
                ))}

                {allLeaves.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center text-muted">
                      No leave requests
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaves