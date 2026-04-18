const bcrypt = require("bcrypt");

/* ================= MODELS ================= */
const Organisation = require("./models/Organisation");
const User = require("./models/User");
const Employee = require("./models/Employee");
const Team = require("./models/Team");
const EmployeeTeam = require("./models/EmployeeTeam");
const Log = require("./models/Log");

const Attendance = require("./models/Attendance");
const Leave = require("./models/Leave");
const Holiday = require("./models/Holiday");
const Project = require("./models/Projects");
const ProjectMember = require("./models/ProjectMember");
const Job = require("./models/Job");
const DailyUpdate = require("./models/DialyUpdate");

/* ================= SEED ================= */
const seedData = async () => {
  try {
    console.log("🌱 Seeding WorkPulse data...");

    /* ================= ORGANISATION ================= */
    let org = await Organisation.findOne({ name: "Basant Technologies" });

    if (!org) {
      org = await Organisation.create({
        name: "Basant Technologies",
      });
      console.log("✅ Organisation created");
    }

    /* ================= USERS ================= */
    const adminPassword = await bcrypt.hash("Admin@123", 10);
    const empPassword = await bcrypt.hash("Emp@123", 10);

    const usersData = [
      {
        name: "Admin Prasanna",
        email: "admin@basant.com",
        isAdmin: true,
        passwordHash: adminPassword,
      },
      {
        name: "Arjun Reddy",
        email: "arjun@basant.com",
        isAdmin: false,
        passwordHash: empPassword,
      },
      {
        name: "Sai Kumar",
        email: "sai@basant.com",
        isAdmin: false,
        passwordHash: empPassword,
        mustChangePassword: true,
      },
      {
        name: "Prakash Reddy",
        email: "prakash@basant.com",
        isAdmin: false,
        passwordHash: empPassword,
      },
    ];

    const createdUsers = {};

    for (let u of usersData) {
      let user = await User.findOne({ email: u.email });

      if (!user) {
        user = await User.create({
          organisationId: org._id,
          name: u.name,
          email: u.email,
          passwordHash: u.passwordHash,
          isAdmin: u.isAdmin,
          mustChangePassword: u.mustChangePassword || false,
          status: "Active",
        });
        console.log(`✅ User created: ${u.email}`);
      }

      createdUsers[u.email] = user;
    }

    /* ================= EMPLOYEES ================= */
    const employeesData = [
      { firstName: "Arjun", lastName: "Reddy", email: "arjun@basant.com" },
      { firstName: "Sai", lastName: "Kumar", email: "sai@basant.com" },
      { firstName: "Prakash", lastName: "Reddy", email: "prakash@basant.com" },
    ];

    const createdEmployees = {};

    for (let e of employeesData) {
      let emp = await Employee.findOne({ email: e.email });

      if (!emp) {
        emp = await Employee.create({
          organisationId: org._id,
          ...e,
          phone: "9999999999",
        });
      }

      createdEmployees[e.email] = emp;
    }

    /* ================= TEAMS ================= */
    const teamNames = ["Development", "HR", "Sales"];
    const createdTeams = {};

    for (let name of teamNames) {
      let team = await Team.findOne({ name });

      if (!team) {
        team = await Team.create({
          organisationId: org._id,
          name,
          description: `${name} Team`,
        });
        console.log(`✅ Team created: ${name}`);
      }

      createdTeams[name] = team;
    }

    /* ================= TEAM MEMBERS ================= */
    const mappings = [
      { emp: "arjun@basant.com", team: "Development" },
      { emp: "sai@basant.com", team: "HR" },
      { emp: "prakash@basant.com", team: "Sales" },
    ];

    for (let m of mappings) {
      const exists = await EmployeeTeam.findOne({
        employeeId: createdEmployees[m.emp]._id,
        teamId: createdTeams[m.team]._id,
      });

      if (!exists) {
        await EmployeeTeam.create({
          employeeId: createdEmployees[m.emp]._id,
          teamId: createdTeams[m.team]._id,
        });
      }
    }

    /* ================= PROJECTS ================= */
    const projectData = [
      { name: "WorkPulse Platform", status: "Active" },
      { name: "Internal HR Tool", status: "Completed" },
    ];

    const createdProjects = {};

    for (let p of projectData) {
      let proj = await Project.findOne({ name: p.name });

      if (!proj) {
        proj = await Project.create({
          organisationId: org._id,
          name: p.name,
          status: p.status,
          startDate: new Date(),
        });
        console.log(`✅ Project created: ${p.name}`);
      }

      createdProjects[p.name] = proj;
    }

    /* ================= PROJECT MEMBERS ================= */
    const projectMembers = [
      { project: "WorkPulse Platform", user: "arjun@basant.com" },
      { project: "WorkPulse Platform", user: "prakash@basant.com" },
      { project: "Internal HR Tool", user: "sai@basant.com" },
    ];

    for (let pm of projectMembers) {
      const exists = await ProjectMember.findOne({
        projectId: createdProjects[pm.project]._id,
        userId: createdUsers[pm.user]._id,
      });

      if (!exists) {
        await ProjectMember.create({
          projectId: createdProjects[pm.project]._id,
          userId: createdUsers[pm.user]._id,
        });
      }
    }

    /* ================= JOBS ================= */
    const jobsData = [
      {
        title: "Frontend Developer",
        requiredSkills: ["React", "JavaScript"],
        qualifications: "Any Degree",
        status: "Open",
      },
      {
        title: "HR Executive",
        requiredSkills: ["Communication"],
        qualifications: "MBA HR",
        status: "Closed",
      },
    ];

    for (let j of jobsData) {
      const exists = await Job.findOne({ title: j.title });

      if (!exists) {
        await Job.create({
          organisationId: org._id,
          ...j,
        });
        console.log(`✅ Job created: ${j.title}`);
      }
    }

    /* ================= DAILY UPDATES ================= */
    const today = new Date().toISOString().split("T")[0];

    const updates = [
      {
        user: "arjun@basant.com",
        description: "Worked on dashboard UI",
      },
      {
        user: "prakash@basant.com",
        description: "Fixed backend bugs",
      },
    ];

    for (let u of updates) {
      const exists = await DailyUpdate.findOne({
        userId: createdUsers[u.user]._id,
        date: today,
      });

      if (!exists) {
        await DailyUpdate.create({
          organisationId: org._id,
          userId: createdUsers[u.user]._id,
          date: today,
          description: u.description,
        });
      }
    }

    /* ================= LOG ================= */
    await Log.create({
      organisationId: org._id,
      userId: createdUsers["admin@basant.com"]._id,
      action: "SEED_COMPLETED",
      event: "SYSTEM",
      status: 201,
      ip: "127.0.0.1",
    });

    console.log("🎉 SEED COMPLETED SUCCESSFULLY");
  } catch (err) {
    console.error("❌ Seed Error:", err.message);
  }
};

module.exports = seedData;