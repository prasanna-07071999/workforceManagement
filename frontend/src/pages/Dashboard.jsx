import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { BASE_URL } from "../services/api";

const Dashboard = () => {
  const history = useHistory();
  const token = localStorage.getItem("jwt");
  const user = token ? JSON.parse(atob(token.split(".")[1])) : null;

  const isAdmin = user?.isAdmin;

  /* ================= STATE ================= */

  const [adminStats, setAdminStats] = useState({
    employees: "--",
    teams: "--",
    projects: "--",
    recruitment: "--",
    attendanceToday: "--",
    pendingLeaves: "--",
    todayUpdates: "--",
    attendanceSnapshot: {
      present: "--",
      absent: "--",
      leave: "--",
    },
    pendingUpdates: "--",
  });

  const [employeeStats, setEmployeeStats] = useState({
    attendanceStatus: "Not Marked",
    myLeaves: "--",
    myProjects: "--",
    currentProject: "--",
    completedProjects: "--",
  });

  /* ================= AUTH ================= */

  useEffect(() => {
    if (!token) {
      history.push("/login");
    }
  }, [token, history]);

  /* ================= ADMIN DASHBOARD ================= */

  useEffect(() => {
    if (!isAdmin || !token) return;

    const headers = { Authorization: `Bearer ${token}` };

    const loadAdminDashboard = async () => {
      try {
        const [
          statsRes,
          teamsRes,
          projectsRes,
          jobsRes,
          attendanceRes,
          leavesRes,
          updatesRes,
        ] = await Promise.all([
          fetch(`${BASE_URL}/api/stats/summary`, { headers }),
          fetch(`${BASE_URL}/api/teams`, { headers }),
          fetch(`${BASE_URL}/api/projects`, { headers }),
          fetch(`${BASE_URL}/api/recruitment/jobs`, { headers }),
          fetch(`${BASE_URL}/api/attendance/summary`, { headers }),
          fetch(`${BASE_URL}/api/leaves`, { headers }),
          fetch(`${BASE_URL}/api/daily-updates`, { headers }),
        ]);

        const stats = await statsRes.json();
        const teams = await teamsRes.json();
        const projects = await projectsRes.json();
        const jobs = await jobsRes.json();
        const attendance = await attendanceRes.json();
        const leaves = await leavesRes.json();
        const updates = await updatesRes.json();

        const pendingLeaves = leaves.filter(l => l.status === "Pending").length;
        console.log(attendance)
        setAdminStats({
          employees: stats.totalEmployees,
          teams: teams.length,
          projects: projects.length,
          recruitment: jobs.length,
          attendanceToday: attendance.present,
          pendingLeaves,
          todayUpdates: updates.length,
          attendanceSnapshot: {
            present: attendance.present,
            absent: attendance.absent,
            leave: attendance.onLeave,
          },
          pendingUpdates: Math.max(
            stats.totalEmployees - updates.length,
            0
          ),
        });
      } catch (err) {
        console.error("Admin dashboard load failed", err);
      }
    };

    loadAdminDashboard();
  }, [isAdmin, token]);

  /* ================= EMPLOYEE DASHBOARD ================= */

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
          fetch(`${BASE_URL}/api/attendance/today`, { headers }),
          fetch(`${BASE_URL}/api/leaves/my`, { headers }),
          fetch(`${BASE_URL}/api/projects/my`, { headers }),
        ]);

        const attendance = await attendanceRes.json();
        const leaves = await leavesRes.json();
        const projects = await projectsRes.json();

        const activeProject = Array.isArray(projects) ? projects.find(p => p.status === "Active"): null;
        const completedCount = projects.filter(p => p.status === "Completed").length;

        setEmployeeStats({
          attendanceStatus: attendance?.status || "Not Marked",
          myLeaves: leaves.length,
          myProjects: projects.length,
          currentProject: activeProject?.name || "--",
          completedProjects: completedCount,
        });
      } catch (err) {
        console.error("Employee dashboard load failed", err);
      }
    };

    loadEmployeeDashboard();
  }, [isAdmin, token]);

  /* ================= UI (UNCHANGED) ================= */

  return (
    <div className="container-fluid px-2 px-md-4 pb-4">
      <div className="mb-4">
        <h4 className="fw-bold">
          Welcome{user?.name ? `, ${user.name}` : ""}
        </h4>
        <p className="text-muted mb-0">
          {isAdmin
            ? "Organization insights and operational overview"
            : "Your daily work overview"}
        </p>
      </div>

      {isAdmin && (
        <>
          <div className="row g-4 mb-4">
            <InsightCard title="Employees" subtitle="Total workforce" value={adminStats.employees} icon="people-fill" color="primary" />
            <InsightCard title="Teams" subtitle="Active teams" value={adminStats.teams} icon="collection-fill" color="success" />
            <InsightCard title="Projects" subtitle="Active & completed" value={adminStats.projects} icon="briefcase-fill" color="warning" onClick={() => history.push("/projects")} />
            <InsightCard title="Recruitment" subtitle="Open positions" value={adminStats.recruitment} icon="person-lines-fill" color="danger" onClick={() => history.push("/recruitment")} />
            <InsightCard title="Attendance" subtitle="Today status" value={adminStats.attendanceToday} icon="calendar-check-fill" color="info" onClick={() => history.push("/attendance")} />
            <InsightCard title="Leaves" subtitle="Pending approvals" value={adminStats.pendingLeaves} icon="calendar-event-fill" color="secondary" onClick={() => history.push("/leaves")} />
            <InsightCard title="Daily Updates" subtitle="Today submissions" value={adminStats.todayUpdates} icon="clipboard-check-fill" color="dark" onClick={() => history.push("/daily-updates")} />
          </div>

          <div className="row g-4">
            <div className="col-12 col-lg-6">
              <ClickablePanel
                title="Today’s Attendance Snapshot"
                subtitle="Organization-wide"
                items={[
                  `Present: ${adminStats.attendanceSnapshot.present}`,
                  `Absent: ${adminStats.attendanceSnapshot.absent}`,
                  `On Leave: ${adminStats.attendanceSnapshot.leave}`,
                ]}
                onClick={() => history.push("/attendance")}
              />
            </div>

            <div className="col-12 col-lg-6">
              <ClickablePanel
                title="Daily Updates Review"
                subtitle="Employee submissions"
                items={[
                  `Submitted today: ${adminStats.todayUpdates}`,
                  `Pending submissions: ${adminStats.pendingUpdates}`,
                ]}
                onClick={() => history.push("/daily-updates")}
              />
            </div>
          </div>
        </>
      )}

      {!isAdmin && (
        <>
          <div className="row g-4 mb-4">
            <InsightCard title="Attendance" subtitle="Today" value={employeeStats.attendanceStatus} icon="clock-fill" color="primary" onClick={() => history.push("/attendance")} />
            <InsightCard title="My Leaves" subtitle="Requests" value={employeeStats.myLeaves} icon="calendar-check-fill" color="success" onClick={() => history.push("/leaves")} />
            <InsightCard title="My Projects" subtitle="Assigned" value={employeeStats.myProjects} icon="briefcase-fill" color="warning" onClick={() => history.push("/projects")} />
          </div>

          <div className="row g-4">
            <div className="col-12 col-lg-6">
              <ClickablePanel
                title="Today’s Checklist"
                subtitle="Important"
                items={["Mark attendance", "Submit daily update"]}
                onClick={() => history.push("/daily-updates")}
              />
            </div>

            <div className="col-12 col-lg-6">
              <ClickablePanel
                title="Project Overview"
                subtitle="Your work"
                items={[
                  `Current project: ${employeeStats.currentProject}`,
                  `Completed projects: ${employeeStats.completedProjects}`,
                ]}
                onClick={() => history.push("/projects")}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

/* ================= REUSABLE (UNCHANGED) ================= */

const InsightCard = ({ title, subtitle, value, icon, color, onClick }) => (
  <div className="col-12 col-sm-6 col-md-3">
    <div className="card shadow-sm h-100 p-md-3" style={{ cursor: onClick ? "pointer" : "default" }} onClick={onClick}>
      <div className={`bg-${color}`} style={{ height: "4px" }} />
      <div className="text-center p-2 p-md-3">
        <i className={`bi bi-${icon} text-${color} fs-3`}></i>
        <small className="text-muted d-block mt-2">{title}</small>
        <h4 className="fw-bold mb-0">{value}</h4>
        <small className="text-muted">{subtitle}</small>
      </div>
    </div>
  </div>
);

const ClickablePanel = ({ title, subtitle, items, onClick }) => (
  <div className="card shadow-sm p-3 h-100 p-md-3" style={{ cursor: "pointer" }} onClick={onClick}>
    <h6 className="fw-bold mb-1">{title}</h6>
    <small className="text-muted">{subtitle}</small>
    <ul className="small mt-2 mb-0">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  </div>
);

export default Dashboard;