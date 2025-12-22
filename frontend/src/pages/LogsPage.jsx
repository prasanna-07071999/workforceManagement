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
    <div className="container mt-4">
      <div className="d-flex flex-row justify-content-between">
        <h2>System Logs</h2>
        <BackButton />
      </div>

      {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

      <table className="table table-bordered mt-3 text-center">
        <thead>
          <tr>
            <th>ID</th>
            <th>User</th>
            <th>Organisation</th>
            <th>Action</th>
            <th>Event</th>
            <th>Status</th>
            <th>IP</th>
            <th>Date & Time</th>
          </tr>
        </thead>

        <tbody>
          {logs.length === 0 ? (
            <tr>
              <td colSpan="8" className="text-center">
                No logs found.
              </td>
            </tr>
          ) : (
            logs.map((log) => (
              <tr key={log.id}>
                <td>{log.id}</td>

                <td>
                  {log.User
                    ? `${log.User.name} (${log.User.email})`
                    : "System"}
                </td>

                <td>
                  {log.Organisation ? log.Organisation.name : "N/A"}
                </td>

                <td>{log.action}</td>

                <td>
                  <span className="badge bg-primary">{log.event}</span>
                </td>

                <td>{log.status}</td>

                <td>{log.ip}</td>

                <td>
                  {log.timestamp
                    ? new Date(log.timestamp).toLocaleString()
                    : ""}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default LogsPage;
