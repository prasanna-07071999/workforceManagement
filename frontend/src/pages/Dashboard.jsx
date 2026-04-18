import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { BASE_URL } from "../services/api";

const Dashboard = () => {
  const history = useHistory();
  const token = localStorage.getItem("jwt");
  const user = token ? JSON.parse(atob(token.split(".")[1])) : null;

  const [loading, setLoading] = useState(true);
  const isAdmin = user?.isAdmin;

  /* ================= STATE ================= */

  const [adminStats, setAdminStats] = useState({
    employees: "--",
    projects: "--",
    attendanceToday: "--",
    pendingLeaves: "--",
    todayUpdates: "--",
    attendanceSnapshot: {
      present: 0,
      absent: 0,
      leave: 0,
    },
    pendingUpdates: "--",
    recruitment: "--",
  });

  const [employeeStats, setEmployeeStats] = useState({
    attendanceStatus: "Not Marked",
    myLeaves: "--",
    myProjects: "--",
    currentProject: "--",
    completedProjects: "--",
  });

  const [recentUpdates, setRecentUpdates] = useState([]);

  /* ================= AUTH ================= */

  useEffect(() => {
    if (!token) {
      history.push("/login");
    }
  }, [token, history]);

  /* ================= ADMIN ================= */

  useEffect(() => {
    if (!isAdmin || !token) return;

    const headers = { Authorization: `Bearer ${token}` };

    const loadAdminDashboard = async () => {
      try {
        const [
          statsRes,
          projectsRes,
          jobsRes,
          attendanceRes,
          leavesRes,
          updatesRes,
        ] = await Promise.all([
          fetch(`${BASE_URL}/api/stats/summary`, { headers }),
          fetch(`${BASE_URL}/api/projects`, { headers }),
          fetch(`${BASE_URL}/api/recruitment/jobs`, { headers }),
          fetch(`${BASE_URL}/api/attendance/summary`, { headers }),
          fetch(`${BASE_URL}/api/leaves`, { headers }),
          fetch(`${BASE_URL}/api/daily-updates`, { headers }),
        ]);

        const stats = await statsRes.json();
        const projects = await projectsRes.json();
        const jobs = await jobsRes.json();
        const attendance = await attendanceRes.json();
        const leaves = await leavesRes.json();
        const updates = await updatesRes.json();

        setRecentUpdates(updates.updates?.slice(0, 5) || []);

        const pendingLeaves = leaves.filter(l => l.status === "Pending").length;

        setAdminStats({
          employees: stats.totalEmployees,
          projects: projects.length,
          recruitment: Array.isArray(jobs) ? jobs.length : 0,
          attendanceToday: attendance.present,

          pendingLeaves,
          todayUpdates: updates.summary?.submitted || 0,
          attendanceSnapshot: {
            present: attendance.present || 0,
            absent: attendance.absent || 0,
            leave: attendance.onLeave || 0,
          },
          pendingUpdates: updates.summary?.missing || 0,
        });

      } catch (err) {
        console.error("Admin dashboard error", err);
      } finally {
        setLoading(false);
      }
    };

    loadAdminDashboard();
  }, [isAdmin, token]);

  /* ================= EMPLOYEE ================= */

  useEffect(() => {
    if (isAdmin || !token) return;

    const headers = { Authorization: `Bearer ${token}` };

    const loadEmployeeDashboard = async () => {
      try {
        const [
          attendanceRes,
          leavesRes,
          projectsRes,
        ] = await Promise.all([
          fetch(`${BASE_URL}/api/attendance/my/today`, { headers }),
          fetch(`${BASE_URL}/api/leaves/my`, { headers }),
          fetch(`${BASE_URL}/api/projects/my`, { headers }),
        ]);

        const attendance = await attendanceRes.json();
        const leaves = await leavesRes.json();
        const projects = await projectsRes.json();

        const activeProject = projects.find(p => p.status === "Active");
        const completedCount = projects.filter(p => p.status === "Completed").length;

        setEmployeeStats({
          attendanceStatus: attendance?.status || "Not Marked",
          myLeaves: leaves.length,
          myProjects: projects.length,
          currentProject: activeProject?.name || "--",
          completedProjects: completedCount,
        });

      } catch (err) {
        console.error("Employee dashboard error", err);
      } finally {
        setLoading(false);
      }
    };

    loadEmployeeDashboard();
  }, [isAdmin, token]);

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "80vh" }}>
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  /* ================= DONUT FIX ================= */

  const total =
    adminStats.attendanceSnapshot.present +
    adminStats.attendanceSnapshot.absent +
    adminStats.attendanceSnapshot.leave || 1;

  const presentDeg = (adminStats.attendanceSnapshot.present / total) * 360;
  const absentDeg = (adminStats.attendanceSnapshot.absent / total) * 360;

  /* ================= UI ================= */

  return (
    <div className="container-fluid px-3 py-3" style={{ background: "#f5f7fb", minHeight: "100vh" }}>

      {/* HEADER */}
      <div className="mb-4">
        <h4 className="fw-bold">
          {getGreeting()}, {user?.name} 👋
        </h4>
        <small className="text-muted">{new Date().toDateString()}</small>
      </div>

      {/* ADMIN */}
      {isAdmin && (
        <>
          <div className="row g-3 mb-4">
            <GradientCard title="Employees" value={adminStats.employees} color="blue" />
            <GradientCard title="Projects" value={adminStats.projects} color="green" />
            <GradientCard title="Attendance" value={adminStats.attendanceToday} color="yellow" />
            <GradientCard title="Leaves" value={adminStats.pendingLeaves} color="teal" />
            <GradientCard title="Jobs" value={adminStats.recruitment} color="purple" />
          </div>

          <div className="row g-4">

            {/* LEFT */}
            <div className="col-lg-8">

              {/* DONUT */}
              <div className="card shadow-sm rounded-4 p-3 mb-3">
                <h6 className="fw-bold mb-3">Attendance Overview</h6>

                <div className="d-flex align-items-center justify-content-between">

                  <div
                    style={{
                      width: 120,
                      height: 120,
                      borderRadius: "50%",
                      background: `conic-gradient(
                        #28a745 ${presentDeg}deg,
                        #dc3545 ${presentDeg + absentDeg}deg,
                        #ffc107 360deg
                      )`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "bold"
                    }}
                  >
                    {adminStats.attendanceToday}
                  </div>

                  <div>
                    <p className="mb-1 text-success">Present: {adminStats.attendanceSnapshot.present}</p>
                    <p className="mb-1 text-danger">Absent: {adminStats.attendanceSnapshot.absent}</p>
                    <p className="mb-0 text-warning">Leave: {adminStats.attendanceSnapshot.leave}</p>
                  </div>

                </div>
              </div>

              {/* RECENT */}
              <div className="card shadow-sm rounded-4 p-3">
                <h6 className="fw-bold mb-3">Recent Activity</h6>

                {recentUpdates.length === 0 ? (
                  <p className="text-muted small">No recent activity</p>
                ) : (
                  recentUpdates.map((u) => (
                    <div key={u._id} className="d-flex align-items-center mb-3">

                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center me-2"
                        style={{ width: 35, height: 35, background: "#e9ecef", fontWeight: "bold" }}
                      >
                        {u.userId?.name?.charAt(0) || "?"}
                      </div>

                      <div className="flex-grow-1">
                        <div className="small">
                          <b>{u.userId?.name}</b> worked on "{(u.description || "").slice(0, 20)}..."
                        </div>
                        <div className="text-muted small">{u.date}</div>
                      </div>

                    </div>
                  ))
                )}
              </div>

            </div>

            {/* RIGHT */}
            <div className="col-lg-4">

              <div className="card shadow-sm rounded-4 p-3 mb-3">
                <h6 className="fw-bold mb-3">Quick Actions</h6>

                <ActionCard text="Add Employee" icon="person-fill" bg="#e7f1ff" color="#0d6efd" onClick={() => history.push("/employees")} />
                <ActionCard text="Create Project" icon="briefcase-fill" bg="#e8f8f1" color="#198754" onClick={() => history.push("/projects")} />
                <ActionCard text="Mark Attendance" icon="clock-fill" bg="#fff4e5" color="#fd7e14" onClick={() => history.push("/attendance")} />
                <ActionCard text="Post Job" icon="file-earmark-text-fill" bg="#f3ecff" color="#6f42c1" onClick={() => history.push("/recruitment")} />

              </div>

              <div className="card shadow-sm rounded-4 p-3 mb-3">
                <h6 className="fw-bold">Updates Summary</h6>
                <p className="text-success mb-1">✔ Submitted: {adminStats.todayUpdates}</p>
                <p className="text-danger mb-0">✖ Missing: {adminStats.pendingUpdates}</p>
              </div>

            </div>

          </div>
        </>
      )}

      {/* EMPLOYEE */}
      {!isAdmin && (
        <div className="row g-4">
          <GradientCard title="Attendance" value={employeeStats.attendanceStatus} color="blue" />
          <GradientCard title="Leaves" value={employeeStats.myLeaves} color="green" />
          <GradientCard title="Projects" value={employeeStats.myProjects} color="yellow" />
          <GradientCard title="Completed" value={employeeStats.completedProjects} color="teal" />
        </div>
      )}

    </div>
  );
};

/* ================= COMPONENTS ================= */

const GradientCard = ({ title, value, color }) => {
  const colors = {
    blue: "linear-gradient(135deg, #4facfe, #00f2fe)",
    green: "linear-gradient(135deg, #43e97b, #38f9d7)",
    yellow: "linear-gradient(135deg, #f6d365, #fda085)",
    teal: "linear-gradient(135deg, #84fab0, #8fd3f4)",
    purple: "linear-gradient(135deg, #a18cd1, #fbc2eb)"
  };

  return (
    <div className="col-6 col-md-4 col-lg-2">
      <div className="p-3 rounded-4 text-white shadow-sm" style={{ background: colors[color], minHeight: "90px" }}>
        <h5 className="fw-bold">{value}</h5>
        <small>{title}</small>
      </div>
    </div>
  );
};

const ActionCard = ({ text, icon, bg, color, onClick }) => (
  <div
    className="d-flex align-items-center justify-content-between p-2 rounded-3 mb-2"
    style={{ background: bg, cursor: "pointer" }}
    onClick={onClick}
  >
    <div className="d-flex align-items-center gap-2">
      <div className="p-2 rounded-3" style={{ background: color, color: "#fff" }}>
        <i className={`bi bi-${icon}`}></i>
      </div>
      <span className="small fw-semibold">{text}</span>
    </div>

    <i className="bi bi-chevron-right"></i>
  </div>
);

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
};

export default Dashboard;