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
const Recruitment = require("./models/Job");
const DailyUpdate = require("./models/DialyUpdate");

/* ================= SEED ================= */
const seedData = async () => {
  try {
    const orgCount = await Organisation.countDocuments();
    if (orgCount > 0) {
      console.log("Seed skipped! Data already exists.");
      return;
    }

    console.log("Seeding WorkPulse sample data...");

    /* ================= ORGANISATION ================= */
    const org = await Organisation.create({
      name: "Basant Technologies",
    });

    /* ================= USERS ================= */
    const adminPassword = await bcrypt.hash("Admin@123", 10);
    const empPassword = await bcrypt.hash("Emp@123", 10);

    const admin = await User.create({
      organisationId: org._id,
      name: "Admin Prasanna",
      email: "admin@basant.com",
      passwordHash: adminPassword,
      isAdmin: true,
      mustChangePassword: false,
      status: "Active",
    });

    const empUser1 = await User.create({
      organisationId: org._id,
      name: "Arjun Reddy",
      email: "arjun@basant.com",
      passwordHash: empPassword,
      isAdmin: false,
      mustChangePassword: false,
      status: "Active",
    });

    const empUser2 = await User.create({
      organisationId: org._id,
      name: "Sai Kumar",
      email: "sai@basant.com",
      passwordHash: empPassword,
      isAdmin: false,
      mustChangePassword: true,
      status: "Active",
    });

    const empUser3 = await User.create({
      organisationId: org._id,
      name: "Prakash Reddy",
      email: "prakash@basant.com",
      passwordHash: empPassword,
      isAdmin: false,
      mustChangePassword: false,
      status: "Active",
    });

    /* ================= EMPLOYEES ================= */
    const emp1 = await Employee.create({
      organisationId: org._id,
      firstName: "Arjun",
      lastName: "Reddy",
      email: "arjun@basant.com",
      phone: "9000112233",
    });

    const emp2 = await Employee.create({
      organisationId: org._id,
      firstName: "Sai",
      lastName: "Kumar",
      email: "sai@basant.com",
      phone: "9001122445",
    });

    const emp3 = await Employee.create({
      organisationId: org._id,
      firstName: "Prakash",
      lastName: "Reddy",
      email: "prakash@basant.com",
      phone: "9876543210",
    });

    /* ================= TEAMS ================= */
    const devTeam = await Team.create({
      organisationId: org._id,
      name: "Development",
      description: "Application development and maintenance",
    });

    const hrTeam = await Team.create({
      organisationId: org._id,
      name: "HR",
      description: "Human resources team",
    });

    const salesTeam = await Team.create({
      organisationId: org._id,
      name: "Sales",
      description: "Sales & marketing team",
    });

    await EmployeeTeam.insertMany([
      { employeeId: emp1._id, teamId: devTeam._id },
      { employeeId: emp2._id, teamId: hrTeam._id },
      { employeeId: emp3._id, teamId: salesTeam._id },
    ]);

    /* ================= HOLIDAYS ================= */
    await Holiday.insertMany([
      { organisationId: org._id, date: "2025-01-26", name: "Republic Day" },
      { organisationId: org._id, date: "2025-08-15", name: "Independence Day" },
      { organisationId: org._id, date: "2025-10-02", name: "Gandhi Jayanthi" },
    ]);

    /* ================= ATTENDANCE ================= */
    const today = new Date().toISOString().split("T")[0];

    await Attendance.insertMany([
      {
        organisationId: org._id,
        userId: empUser1._id,
        date: today,
        status: "Present",
        checkInTime: new Date(),
        checkOutTime: new Date(),
      },
      {
        organisationId: org._id,
        userId: empUser2._id,
        date: today,
        status: "Leave",
      },
      {
        organisationId: org._id,
        userId: empUser3._id,
        date: today,
        status: "Present",
        checkInTime: new Date(),
        checkOutTime: new Date(),
      },
    ]);

    /* ================= LEAVES ================= */
    await Leave.insertMany([
      {
        organisationId: org._id,
        userId: empUser2._id,
        fromDate: "2025-01-05",
        toDate: "2025-01-07",
        reason: "Personal work",
        status: "Approved",
        approvedBy: admin._id,
        approvedAt: new Date(),
      },
      {
        organisationId: org._id,
        userId: empUser3._id,
        fromDate: "2025-01-12",
        toDate: "2025-01-13",
        reason: "Medical leave",
        status: "Pending",
      },
    ]);

    /* ================= PROJECTS ================= */
    const project1 = await Project.create({
      organisationId: org._id,
      name: "WorkPulse Platform",
      status: "Active",
      startDate: "2024-11-01",
    });

    const project2 = await Project.create({
      organisationId: org._id,
      name: "Internal HR Tool",
      status: "Completed",
      startDate: "2024-05-01",
      endDate: "2024-09-30",
    });

    await ProjectMember.insertMany([
      { projectId: project1._id, userId: empUser1._id },
      { projectId: project1._id, userId: empUser3._id },
      { projectId: project2._id, userId: empUser2._id },
    ]);

    /* ================= RECRUITMENT ================= */
    await Recruitment.insertMany([
      {
        organisationId: org._id,
        name: "Ravi Teja",
        email: "ravi@gmail.com",
        title: "Frontend Developer",
        status: "Open"
      },
      {
        organisationId: org._id,
        name: "Anusha",
        email: "anusha@gmail.com",
        title: "HR Executive",
        status: "Closed"
      }
    ]);

    /* ================= DAILY UPDATES ================= */
    await DailyUpdate.insertMany([
      {
        organisationId: org._id,
        userId: empUser1._id,
        date: today,
        description: "Worked on attendance module and fixed bugs.",
      },
      {
        organisationId: org._id,
        userId: empUser3._id,
        date: today,
        description: "Implemented recruitment APIs and validations.",
      },
    ]);

    /* ================= LOG ================= */
    await Log.create({
      organisationId: org._id,
      userId: admin._id,
      action: "SEED_COMPLETED",
      event: "SYSTEM",
      status: 201,
      ip: "127.0.0.1",
    });

    console.log("WorkPulse seed completed successfully");
  } catch (error) {
    console.error("Seed error:", error.message);
  }
};

module.exports = seedData;
