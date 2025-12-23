import React, { useEffect, useState } from "react";
import BackButton from "../components/BackButton";
import { BASE_URL } from "../services/api";

const LogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("jwt");
        const response = await fetch(`${BASE_URL}/api/logs`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          setErrorMsg("Failed to fetch logs. Unauthorized or server error.");
          setLogs([]);
          setLoading(false);
          return;
        }
        const data = await response.json();
        const logData = Array.isArray(data) ? data : data.logs || [];
        console.log(logData)
        setLogs(logData);
      } catch (error) {
        setErrorMsg("Something went wrong loading logs.");
        setLogs([]);
      }
      setLoading(false);
    };

    fetchLogs();
  }, []);

  if (loading) {
    return (
      <div className="container mt-4">
        <span>Loading logs...</span>
      </div>
    );
  }

  return (
    <div className="container-fluid mt-4 px-4">
  <div className="d-flex justify-content-between align-items-center">
    <h2 className="mb-0">System Logs</h2>
    <BackButton />
  </div>

  {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

  <div className="table-responsive mt-3">
    <table className="table table-bordered text-center">
      <thead>
        <tr>
          <th>Log ID</th>
          <th>User</th>
          <th>Organisation</th>
          <th>Action</th>
          <th>Event</th>
          <th>Status</th>
          <th>IP</th>
          <th>Date</th>
          <th>Time</th>
        </tr>
      </thead>
      <tbody>
        {logs.length === 0 ? (
          <tr>
            <td colSpan="9">No logs found.</td>
          </tr>
        ) : (
          logs.map((log) => (
            <tr key={log._id}>
              <td>{log._id.slice(-6)}</td>
              <td>
                {log.userId
                  ? `${log.userId.name} (${log.userId.email})`
                  : "System"}
              </td>
              <td>{log.organisationId?.name || "N/A"}</td>
              <td>{log.action}</td>
              <td>
                <span className="badge bg-primary">{log.event}</span>
              </td>
              <td>{log.status}</td>
              <td>{log.ip}</td>
              <td>{new Date(log.timestamp).toLocaleDateString()}</td>
              <td>{new Date(log.timestamp).toLocaleTimeString()}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
</div>

  );
};

export default LogsPage;
