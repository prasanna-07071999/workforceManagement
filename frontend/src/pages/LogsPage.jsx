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
  <div className="container-fluid mt-4 px-2 px-md-4">
    {/* Header */}
    <div className="d-flex justify-content-between align-items-center mb-3">
      <h2 className="mb-0">System Logs</h2>
      <BackButton />
    </div>

    {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

    {/* Logs Table */}
    <div className="table-responsive">
      <table className="table table-bordered table-sm text-center small align-middle">
        <thead className="table-light">
          <tr>
            <th style={{ width: "80px" }}>Log ID</th>
            <th>User</th>
            <th className="d-none d-md-table-cell">Organisation</th>
            <th>Action</th>
            <th className="event-col">Event</th>
            <th style={{ width: "70px" }}>Status</th>
            <th className="d-none d-lg-table-cell">IP</th>
            <th style={{ width: "90px" }}>Date</th>
            <th className="d-none d-md-table-cell">Time</th>
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

                <td className="text-break">
                  {log.userId
                    ? `${log.userId.name} (${log.userId.email})`
                    : "System"}
                </td>

                <td className="d-none d-md-table-cell">
                  {log.organisationId?.name || "N/A"}
                </td>

                <td className="text-break">{log.action}</td>

                <td>
                  <span className="badge bg-primary event-badge">
                    {log.event}
                  </span>
                </td>

                <td>{log.status}</td>

                <td className="d-none d-lg-table-cell text-break">
                  {log.ip || "N/A"}
                </td>

                <td>
                  {new Date(log.timestamp).toLocaleDateString()}
                </td>

                <td className="d-none d-md-table-cell">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </td>
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
