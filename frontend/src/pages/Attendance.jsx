import React, { useEffect, useState, useCallback } from "react";
import BackButton from "../components/BackButton";
import { BASE_URL } from "../services/api";
import { getAuthState } from "../utils/auth";

const Attendance = () => {
  const token = localStorage.getItem("jwt");
  const auth = getAuthState();
  const isAdmin = auth?.isAdmin;

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [todayAttendance, setTodayAttendance] = useState(null);
  const [loadingToday, setLoadingToday] = useState(true);

  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [monthlyData, setMonthlyData] = useState([]);

  const [attendanceList, setAttendanceList] = useState([]);
  const [summary, setSummary] = useState(null);

  const fetchTodayAttendance = useCallback(async () => {
    try {
      setLoadingToday(true);
      const res = await fetch(`${BASE_URL}/api/attendance/my/today`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setTodayAttendance(data || null);
    } finally {
      setLoadingToday(false);
    }
  }, [token]);

  const fetchMonthlyAttendance = useCallback(async () => {
    const res = await fetch(
      `${BASE_URL}/api/attendance/my/monthly?month=${month}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setMonthlyData(await res.json());
  }, [token, month]);

  const fetchAdminAttendance = useCallback(async () => {
    const headers = { Authorization: `Bearer ${token}` };
    const [listRes, summaryRes] = await Promise.all([
      fetch(`${BASE_URL}/api/attendance/today`, { headers }),
      fetch(`${BASE_URL}/api/attendance/summary`, { headers })
    ]);
    setAttendanceList(await listRes.json());
    setSummary(await summaryRes.json());
  }, [token]);

  const markAttendance = async () => {
    const res = await fetch(`${BASE_URL}/api/attendance/mark`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    const data = await res.json();
    if (res.ok) {
      setSuccessMsg(data.message);
      fetchTodayAttendance();
    } else {
      setErrorMsg(data.message);
    }
  };

  useEffect(() => {
    if (!token) return;
    isAdmin ? fetchAdminAttendance() : fetchTodayAttendance();
  }, [token, isAdmin, fetchAdminAttendance, fetchTodayAttendance]);

  useEffect(() => {
    if (!isAdmin) fetchMonthlyAttendance();
  }, [month, isAdmin, fetchMonthlyAttendance]);

  const hasCheckedIn = !!todayAttendance?.checkInTime;
  const hasCheckedOut = !!todayAttendance?.checkOutTime;

  return (
    <div className="container-fluid px-2 px-md-4">
      <div className="d-flex justify-content-between mb-3">
        <h4 className="fw-bold">{isAdmin ? "Attendance (Admin)" : "Attendance"}</h4>
        <BackButton />
      </div>

      {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      {!isAdmin && (
        <>
          <div className="card p-3 mb-3">
            <h6>Today</h6>
            {loadingToday ? "Loading..." : (
              <>
                {todayAttendance?.isHoliday ? (
                  <div className="alert alert-warning">
                    🎉 {todayAttendance.holidayName} (Holiday)
                  </div>
                ) : (
                  <>
                    <div>Status: <b>{todayAttendance?.status || "Not Marked"}</b></div>

                    <button
                      className="btn btn-primary btn-sm me-2"
                      disabled={hasCheckedIn}
                      onClick={markAttendance}
                    >
                      Check In
                    </button>

                    <button
                      className="btn btn-outline-secondary btn-sm"
                      disabled={!hasCheckedIn || hasCheckedOut}
                      onClick={markAttendance}
                    >
                      Check Out
                    </button>
                  </>
                )}
                <button className="btn btn-primary btn-sm me-2"
                  disabled={hasCheckedIn}
                  onClick={markAttendance}>Check In</button>
                <button className="btn btn-outline-secondary btn-sm"
                  disabled={!hasCheckedIn || hasCheckedOut}
                  onClick={markAttendance}>Check Out</button>
              </>
            )}
          </div>

          <div className="card p-3">
            <h6>Monthly Attendance</h6>
            <input type="month" className="form-control mb-2"
              value={month} onChange={e => setMonth(e.target.value)} />

            {monthlyData.map(a => (
              <div key={a._id} className="border rounded p-2 mb-2">
                <b>{a.date}</b>
                <div>Status: {a.status}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {isAdmin && (
        <>
          {summary && (
            <div className="row mb-3">
              <SummaryCard title="Present" value={summary.present} color="success" />
              <SummaryCard title="Absent" value={summary.absent} color="danger" />
              <SummaryCard title="On Leave" value={summary.onLeave} color="warning" />
            </div>
          )}

          <div className="d-none d-md-block">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Name</th><th>Email</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {attendanceList.map(a => (
                  <tr key={a._id}>
                    <td>{a.userId?.name}</td>
                    <td>{a.userId?.email}</td>
                    <td>{a.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="d-md-none">
            {attendanceList.map(a => (
              <div key={a._id} className="card p-2 mb-2">
                <b>{a.userId?.name}</b>
                <div>{a.userId?.email}</div>
                <div>Status: {a.status}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const SummaryCard = ({ title, value, color }) => (
  <div className="col-12 col-md-4 mb-2">
    <div className={`card border-${color} p-3 text-center`}>
      <h6>{title}</h6>
      <h4 className={`text-${color}`}>{value}</h4>
    </div>
  </div>
);

export default Attendance