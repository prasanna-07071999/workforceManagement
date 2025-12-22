const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -----------------------------
// Load environment based file
// -----------------------------
const env = process.env.NODE_ENV || "development";
console.log("Running Environment:", env);
const envPath = path.join(__dirname, `.env.${env}`);

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log(`Loaded environment config: ${envPath}`);
} else {
  console.warn(`Environment file missing: ${envPath}. Falling back to process.env`);
}

// Validate minimal env
if (!process.env.MONGO_URI) {
  console.error("MONGO_URI not set. Please configure config/env.development or env.production");
  process.exit(1);
}
if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET not set. Please configure config/env.*");
  process.exit(1);
}

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;

// -----------------------------
// Mongoose connection
// -----------------------------
mongoose
  .connect(process.env.MONGO_URI, {
    // options if needed
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// -----------------------------
// Schemas / Models
// -----------------------------
const { Schema, model, Types } = mongoose;

const OrganisationSchema = new Schema(
  {
    name: { type: String, required: true }
  },
  { timestamps: true }
);
const Organisation = model("Organisation", OrganisationSchema);

const UserSchema = new Schema(
  {
    organisationId: { type: Schema.Types.ObjectId, ref: "Organisation", required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },
    isAdmin: { type: Boolean, default: false }
  },
  { timestamps: true }
);
const User = model("User", UserSchema);

const EmployeeSchema = new Schema(
  {
    organisationId: { type: Schema.Types.ObjectId, ref: "Organisation", required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: false },
    phone: { type: String }
  },
  { timestamps: true }
);
const Employee = model("Employee", EmployeeSchema);

const TeamSchema = new Schema(
  {
    organisationId: { type: Schema.Types.ObjectId, ref: "Organisation", required: true },
    name: { type: String, required: true },
    description: { type: String }
  },
  { timestamps: true }
);
const Team = model("Team", TeamSchema);

const EmployeeTeamSchema = new Schema(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
    teamId: { type: Schema.Types.ObjectId, ref: "Team", required: true },
    assignedAt: { type: Date, default: Date.now }
  },
  { timestamps: false }
);
EmployeeTeamSchema.index({ employeeId: 1, teamId: 1 }, { unique: true }); // prevent duplicates
const EmployeeTeam = model("EmployeeTeam", EmployeeTeamSchema);

const LogSchema = new Schema(
  {
    organisationId: { type: Schema.Types.ObjectId, ref: "Organisation", default: null },
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    action: { type: String, required: true },
    event: { type: String, default: null },
    status: { type: Number, default: null },
    ip: { type: String, default: null },
    timestamp: { type: Date, default: Date.now }
  },
  { timestamps: true }
);
const Log = model("Log", LogSchema);

// -----------------------------
// Utilities: createLog
// -----------------------------
const createLog = async ({ req, action, event, status, organisationId, userId }) => {
  try {
    const user = (req && req.user) ? req.user : null;
    await Log.create({
      organisationId: organisationId || (user ? user.organisationId : null),
      userId: userId || (user ? user.id : null),
      action: action || `${req ? req.method + " " + req.originalUrl : "SYSTEM"}`,
      event: event || null,
      status: status || (req && req.res ? req.res.statusCode : null),
      ip: req ? (req.headers["x-forwarded-for"] || req.ip || "") : null,
      timestamp: new Date()
    });
  } catch (err) {
    console.error("createLog error:", err.message);
  }
};

// -----------------------------
// Seed data (runs once if collections empty)
// -----------------------------
const seedData = async () => {
  try {
    const orgCount = await Organisation.countDocuments();
    if (orgCount > 0) {
      console.log("Seed: data already present, skipping.");
      return;
    }

    console.log("Seed: populating initial data...");

    // Organisations
    const org1 = await Organisation.create({ name: "Basant Technologies" });
    const org2 = await Organisation.create({ name: "Infosys Software Solutions" });

    // Users (admins)
    const passwordHash = await bcrypt.hash("Password123", 10);
    const admin1 = await User.create({
      organisationId: org1._id,
      email: "admin1@basanttech.com",
      passwordHash,
      name: "Tony Admin",
      isAdmin: true
    });
    const admin2 = await User.create({
      organisationId: org2._id,
      email: "admin2@infosolutions.com",
      passwordHash,
      name: "Ravi Admin",
      isAdmin: true
    });

    // Employees
    const emp1 = await Employee.create({
      organisationId: org1._id,
      firstName: "John",
      lastName: "Cena",
      email: "john.cena@basanttech.com",
      phone: "9876543210"
    });
    const emp2 = await Employee.create({
      organisationId: org1._id,
      firstName: "Steve",
      lastName: "Smith",
      email: "steve.smith@infosolutions.com",
      phone: "9876543210"
    });
    const emp3 = await Employee.create({
      organisationId: org2._id,
      firstName: "Mike",
      lastName: "Kumar",
      email: "mike.kumar@infosolutions.com",
      phone: "5555555555"
    });

    // Teams
    const team1 = await Team.create({
      organisationId: org1._id,
      name: "Development",
      description: "Basant Development Team"
    });
    const team2 = await Team.create({
      organisationId: org1._id,
      name: "Marketing",
      description: "InfoSolutions Marketing Team"
    });
    const team3 = await Team.create({
      organisationId: org2._id,
      name: "Sales",
      description: "Basant Sales Team"
    });

    // EmployeeTeam mappings
    await EmployeeTeam.create({ employeeId: emp1._id, teamId: team1._id });
    await EmployeeTeam.create({ employeeId: emp2._id, teamId: team1._id });
    await EmployeeTeam.create({ employeeId: emp2._id, teamId: team2._id });
    await EmployeeTeam.create({ employeeId: emp3._id, teamId: team3._id });

    // Logs
    await Log.create({
      organisationId: org1._id,
      userId: admin1._id,
      action: "Admin seeded and logged in",
      event: "SEED_ADMIN_CREATED",
      status: 201,
      ip: "127.0.0.1"
    });
    await Log.create({
      organisationId: org2._id,
      userId: admin2._id,
      action: "Admin seeded",
      event: "SEED_ADMIN_CREATED",
      status: 201,
      ip: "127.0.0.1"
    });

    console.log("Seed data inserted.");
  } catch (err) {
    console.error("Seed error:", err);
  }
};

// -----------------------------
// Middlewares
// -----------------------------
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // find user
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      organisationId: user.organisationId ? user.organisationId.toString() : null,
      isAdmin: Boolean(user.isAdmin)
    };
    req.organisationId = req.user.organisationId;
    next();
  } catch (err) {
    console.error("authMiddleware:", err.message);
    return res.status(401).json({ message: "Invalid token", error: err.message });
  }
};

const adminOnly = (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (!req.user.isAdmin) return res.status(403).json({ message: "Access denied. Admins only." });
    next();
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Logging middleware - creates a log entry after response finishes
const logMiddleware = (req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const method = req.method;
    let event = "REQUEST";
    if (method === "POST") event = "CREATE";
    else if (method === "PUT" || method === "PATCH") event = "UPDATE";
    else if (method === "DELETE") event = "DELETE";
    else if (method === "GET") event = "READ";

    createLog({
      req,
      action: `${req.method} ${req.originalUrl}`,
      event,
      status: res.statusCode
    });
  });
  next();
};

// Error handler
const errorHandler = (err, req, res, next) => {
  console.error("ERROR:", err.message);
  res.status(err.statusCode || 500).json({
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.stack : undefined
  });
};

// -----------------------------
// Express app + CORS
// -----------------------------


const clientOrigin =
  process.env.NODE_ENV === "production"
    ? (process.env.CLIENT_ORIGIN_PROD || "https://workforcemanagement-frontend.onrender.com")
    : (process.env.CLIENT_ORIGIN_DEV || "http://localhost:3000");

app.use(
  cors({
    origin: clientOrigin,
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization",
    credentials: true
  })
);

// Public health route
app.get("/", (req, res) => res.send(`HRMS API (env: ${env})`));

app.post("/api/auth/register", async (req, res) => {
  try {
    const { orgName, adminName, email, password, isAdmin } = req.body;
    if (!orgName || !adminName || !email || !password) {
      return res.status(400).json({ message: "orgName, adminName, email and password required" });
    }

    // create organisation
    const org = await Organisation.create({ name: orgName });

    // hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // create user
    const user = await User.create({
      organisationId: org._id,
      email,
      passwordHash,
      name: adminName,
      isAdmin: Boolean(isAdmin)
    });

    const token = jwt.sign(
        {
            userId: user._id.toString(),
            name: user.name,
            email: user.email,
            organisationId: org._id.toString(),
            organisationName: org.name,
            isAdmin: user.isAdmin
        },
        JWT_SECRET,
        { expiresIn: "8h" }
    );


    await createLog({
      req,
      action: "USER_REGISTER",
      event: "USER_REGISTER",
      status: 201,
      organisationId: org._id,
      userId: user._id
    });

    res.status(201).json({ token, isAdmin: user.isAdmin });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Registration Failed", error: err.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "email and password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User Not Found" });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(401).json({ message: "Invalid Password" });

    const organisation = await Organisation.findById(user.organisationId);

    const token = jwt.sign(
        {
            userId: user._id.toString(),
            name: user.name,
            email: user.email,
            organisationId: organisation ? organisation._id.toString() : null,
            organisationName: organisation ? organisation.name : "",
            isAdmin: user.isAdmin
        },
        JWT_SECRET,
        { expiresIn: "8h" }
    );
    await createLog({
      req,
      action: "USER_LOGIN",
      event: "USER_LOGIN",
      status: 200
    });

    res.json({ token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Login Failed", error: err.message });
  }
});

// -----------------------------
// Protected routes: require auth
// attach middlewares globally from here
// -----------------------------
app.use(authMiddleware);
app.use(logMiddleware);

// -----------------------------
// EMPLOYEE ROUTES
// GET /api/employees
// GET /api/employees/:id
// POST /api/employees
// PUT /api/employees/:id
// DELETE /api/employees/:id
// -----------------------------
const checkOrgOwnershipEmployee = (req, employee) =>
  employee.organisationId.toString() === req.user.organisationId;

app.get("/api/employees", async (req, res) => {
  try {
    const employees = await Employee.find({ organisationId: req.user.organisationId });
    res.json(employees);
  } catch (err) {
    console.error("getAllEmployees:", err);
    res.status(500).json({ message: "failed to Fetch Employees", error: err.message });
  }
});

app.get("/api/employees/:id", async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee || !checkOrgOwnershipEmployee(req, employee)) {
      return res.status(404).json({ message: "Employee Not Found" });
    }
    res.json(employee);
  } catch (err) {
    console.error("getEmployeeById:", err);
    res.status(500).json({ message: "failed to Fetch Employee", error: err.message });
  }
});

app.post("/api/employees", async (req, res) => {
  try {
    const { firstName, lastName, email, phone } = req.body;
    if (!firstName || !lastName) return res.status(400).json({ message: "firstName & lastName required" });

    const employee = await Employee.create({
      organisationId: req.user.organisationId,
      firstName,
      lastName,
      email,
      phone
    });

    await createLog({
      req,
      action: "EMPLOYEE_CREATED",
      event: "EMPLOYEE_CREATED",
      status: 201,
      userId: req.user.id,
      organisationId: req.user.organisationId
    });

    res.status(201).json(employee);
  } catch (err) {
    console.error("createEmployee:", err);
    res.status(500).json({ message: "Failed to Create Employee", error: err.message });
  }
});

app.put("/api/employees/:id", async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee || !checkOrgOwnershipEmployee(req, employee)) {
      return res.status(404).json({ message: "Employee Not Found" });
    }

    Object.assign(employee, req.body);
    await employee.save();

    await createLog({
      req,
      action: "EMPLOYEE_UPDATED",
      event: "EMPLOYEE_UPDATED",
      status: 200,
      userId: req.user.id,
      organisationId: req.user.organisationId,
      employeeId: employee._id
    });

    res.json(employee);
  } catch (err) {
    console.error("updateEmployee:", err);
    res.status(500).json({ message: "Failed to update Employee", error: err.message });
  }
});

app.delete("/api/employees/:id", async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee || !checkOrgOwnershipEmployee(req, employee)) {
      return res.status(404).json({ message: "Employee Not Found" });
    }

    await Employee.deleteOne({ _id: employee._id })

    await createLog({
      req,
      action: "EMPLOYEE_DELETED",
      event: "EMPLOYEE_DELETED",
      status: 200,
      userId: req.user.id,
      organisationId: req.user.organisationId,
      employeeId: employee._id
    });

    res.json({ message: "Employee Deleted Successfully" });
  } catch (err) {
    console.error("deleteEmployee:", err);
    res.status(500).json({ message: "Failed to Delete Employee", error: err.message });
  }
});

// -----------------------------
// TEAM ROUTES
// GET /api/teams
// GET /api/teams/:id
// POST /api/teams
// PUT /api/teams/:id
// DELETE /api/teams/:id
// POST /api/teams/:teamId/assign
// DELETE /api/teams/:teamId/unassign
// -----------------------------
const checkOrgOwnershipTeam = (req, team) => team.organisationId.toString() === req.user.organisationId;

app.get("/api/teams", async (req, res) => {
  try {
    const teams = await Team.find({ organisationId: req.user.organisationId });
    res.json(teams);
  } catch (err) {
    console.error("getAllTeams:", err);
    res.status(500).json({ message: "Failed to fetch teams", error: err.message });
  }
});

app.get("/api/teams/:id", async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team || !checkOrgOwnershipTeam(req, team)) {
      return res.status(404).json({ message: "Team Not Found" });
    }
    res.json(team);
  } catch (err) {
    console.error("getTeamById:", err);
    res.status(500).json({ message: "Failed to fetch team", error: err.message });
  }
});

app.post("/api/teams", async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: "name required" });

    const team = await Team.create({
      organisationId: req.user.organisationId,
      name,
      description
    });

    await createLog({
      req,
      action: "TEAM_CREATED",
      event: "TEAM_CREATED",
      status: 201,
      userId: req.user.id,
      organisationId: req.user.organisationId,
      teamId: team._id
    });

    res.status(201).json(team);
  } catch (err) {
    console.error("createTeam:", err);
    res.status(500).json({ message: "Failed to create team", error: err.message });
  }
});

app.put("/api/teams/:id", async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team || !checkOrgOwnershipTeam(req, team)) return res.status(404).json({ message: "Team Not Found" });

    Object.assign(team, req.body);
    await team.save();

    await createLog({
      req,
      action: "TEAM_UPDATED",
      event: "TEAM_UPDATED",
      status: 200,
      userId: req.user.id,
      organisationId: req.user.organisationId,
      teamId: team._id
    });

    res.json(team);
  } catch (err) {
    console.error("updateTeam:", err);
    res.status(500).json({ message: "Failed to update team", error: err.message });
  }
});

app.delete("/api/teams/:id", async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team || !checkOrgOwnershipTeam(req, team)) return res.status(404).json({ message: "Team Not Found" });

    // remove employee-team mappings for this team
    await EmployeeTeam.deleteMany({ teamId: team._id });

    await Team.deleteOne({ _id: team._id });

    await createLog({
      req,
      action: "TEAM_DELETED",
      event: "TEAM_DELETED",
      status: 200,
      userId: req.user.id,
      organisationId: req.user.organisationId,
      teamId: team._id
    });

    res.json({ message: "Team deleted successfully" });
  } catch (err) {
    console.error("deleteTeam:", err);
    res.status(500).json({ message: "Failed to delete team", error: err.message });
  }
});

// Assign employees to a team (single or multiple)
app.post("/api/teams/:teamId/assign", async (req, res) => {
  try {
    const { employeeId, employeeIds } = req.body;
    const ids = employeeIds || (employeeId ? [employeeId] : []);
    if (!ids.length) return res.status(400).json({ message: "No employee IDs provided" });

    const team = await Team.findById(req.params.teamId);
    if (!team || !checkOrgOwnershipTeam(req, team)) return res.status(404).json({ message: "Team not found" });

    // validate employees belong to same org
    const objectIds = ids.map((id) => new Types.ObjectId(id));
    const validEmployees = await Employee.find({
      _id: { $in: objectIds },
      organisationId: req.user.organisationId
    });

    // create EmployeeTeam mappings, ignore duplicates
    const ops = validEmployees.map((e) =>
      EmployeeTeam.updateOne(
        { employeeId: e._id, teamId: team._id },
        { $setOnInsert: { assignedAt: new Date() } },
        { upsert: true }
      )
    );
    await Promise.all(ops);

    await createLog({
      req,
      action: "TEAM_EMPLOYEES_ASSIGNED",
      event: "TEAM_EMPLOYEES_ASSIGNED",
      status: 200,
      userId: req.user.id,
      organisationId: req.user.organisationId,
      teamId: team._id
    });

    res.json({ message: "Employees assigned successfully" });
  } catch (err) {
    console.error("assignEmployees:", err);
    res.status(500).json({ message: "Failed to assign employees", error: err.message });
  }
});

// Unassign employee from team
app.delete("/api/teams/:teamId/unassign", async (req, res) => {
  try {
    const { employeeId } = req.body;
    if (!employeeId) return res.status(400).json({ message: "Employee ID required" });

    const team = await Team.findById(req.params.teamId);
    if (!team || !checkOrgOwnershipTeam(req, team)) return res.status(404).json({ message: "Team not found" });

    await EmployeeTeam.deleteOne({ teamId: team._id, employeeId: new Types.ObjectId(employeeId) });

    await createLog({
      req,
      action: "TEAM_EMPLOYEE_UNASSIGNED",
      event: "TEAM_EMPLOYEE_UNASSIGNED",
      status: 200,
      userId: req.user.id,
      organisationId: req.user.organisationId,
      teamId: team._id
    });

    res.json({ message: "Employee unassigned successfully" });
  } catch (err) {
    console.error("unassignEmployee:", err);
    res.status(500).json({ message: "Failed to unassign employee", error: err.message });
  }
});

// -----------------------------
// LOGS (admins only)
// GET /api/logs
// -----------------------------
app.get("/api/logs", adminOnly, async (req, res) => {
  try {
    const logs = await Log.find()
      .populate("userId", "name email")
      .populate("organisationId", "name")
      .sort({ timestamp: -1 })
      .limit(1000);

    res.json({ success: true, count: logs.length, logs });
  } catch (err) {
    console.error("getLogs:", err);
    res.status(500).json({ message: "Failed to fetch logs", error: err.message });
  }
});

// -----------------------------
// STATS
// GET /api/stats/summary
// -----------------------------


app.get("/api/stats/summary", authMiddleware, async (req, res) => {
  try {
    const totalEmployees = await Employee.countDocuments({ organisationId: req.user.organisationId });
    const totalTeams = await Team.countDocuments({ organisationId: req.user.organisationId });
    const totalAdmins = await User.countDocuments({ organisationId: req.user.organisationId, isAdmin: true });

    res.json({ totalEmployees, totalTeams, totalAdmins });
  } catch (err) {
    console.error("stats summary:", err);
    res.status(500).json({ message: "Failed to load stats", error: err.message });
  }
});

app.use(errorHandler);

// Run seed and start server
(async () => {
  await seedData();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} (env: ${env})`);
  });
})();
