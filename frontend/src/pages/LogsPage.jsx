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
  <div className="container-fluid mt-3 px-2 px-md-4">
    {/* Header */}
    <div className="d-flex justify-content-between align-items-center mb-3">
      <h4 className="mb-0">System Logs</h4>
      <BackButton />
    </div>

    {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

    {/* ================= MOBILE VIEW ================= */}
    <div className="d-md-none">
      {logs.length === 0 ? (
        <div className="text-center text-muted">No logs found</div>
      ) : (
        logs.map((log) => (
          <div key={log._id} className="card shadow-sm mb-2">
            <div className="card-body p-2">
              <div className="d-flex justify-content-between">
                <small className="text-muted">
                  {new Date(log.timestamp).toLocaleString()}
                </small>
                <span className="badge bg-primary">{log.event}</span>
              </div>

              <div className="mt-1 small fw-semibold">
                {log.action}
              </div>

              <div className="mt-1 small text-muted">
                User: {log.user? log.user.name: "System"}
              </div>

              <div className="small text-muted">
                Org: {log.organisation || "System"}
              </div>

              <div className="small">
                Status: <strong>{log.status}</strong>
              </div>
            </div>
          </div>
        ))
      )}
    </div>

    {/* ================= TABLET + DESKTOP ================= */}
    <div className="table-responsive d-none d-md-block">
      <table className="table table-bordered table-sm align-middle" style={{ tableLayout: "fixed" }}>
        <thead className="table-light">
          <tr className="small text-center">
            <th style={{ width: "60px" }}>ID</th>
            <th>User</th>
            <th className="d-none d-lg-table-cell">Organisation</th>
            <th>Action</th>
            <th style={{ minWidth: "200px" }}>Event</th>
            <th style={{ width: "60px" }}>Status</th>
            <th className="d-none d-lg-table-cell">IP</th>
            <th>Date</th>
            <th className="d-none d-lg-table-cell">Time</th>
          </tr>
        </thead>

        <tbody className="small">
          {logs.length === 0 ? (
            <tr>
              <td colSpan="9" className="text-center">
                No logs found
              </td>
            </tr>
          ) : (
            logs.map((log) => (
              <tr key={log._id}>
                <td style={{ fontSize: "12px" }}>{log._id.slice(-6)}</td>

                <td className="text-break" title={log?.user?.email || ""}>
                  {log.user? log.user.name : "System"}
                </td>

                <td className="d-none d-lg-table-cell">
                  {log.organisation || "N/A"}
                </td>

                <td className="text-break" style={{ fontSize: "11px" }}>
                  {log.action}
                </td>

                <td style={{ minWidth: "200px" }}>
                  <span
                    className="badge bg-primary"
                    style={{ fontSize: "11px", whiteSpace: "normal" }}
                  >
                    {log.event}
                  </span>
                </td>

                <td style={{ width: "60px", fontWeight: "600" }}>{log.status}</td>


                <td className="d-none d-lg-table-cell text-break">
                  {log.ip || "N/A"}
                </td>

                <td>
                  {new Date(log.timestamp).toLocaleDateString()}
                </td>

                <td className="d-none d-lg-table-cell">
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
