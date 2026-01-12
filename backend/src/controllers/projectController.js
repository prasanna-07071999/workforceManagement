const Project = require("../models/Projects");
const ProjectMember = require("../models/ProjectMember");
const createLog = require("../utils/createLog");

/**
 * ADMIN: Create project
 */
const createProject = async (req, res) => {
  const { name, description, startDate } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Project name required" });
  }

  const project = await Project.create({
    organisationId: req.user.organisationId,
    name,
    description,
    startDate
  });

  await createLog({
    req,
    action: "POST /api/projects",
    event: "PROJECT_CREATED",
    status: 201
  });

  res.status(201).json(project);
};

/**
 * ADMIN: Update project status
 */
const updateProjectStatus = async (req, res) => {
  const { status } = req.body;
  const { projectId } = req.params;

  if (!["Upcoming", "Active", "Completed"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const project = await Project.findByIdAndUpdate(
    projectId,
    { status },
    { new: true }
  );
  await createLog({
    req,
    action: "PUT /api/projects/:id",
    event: "PROJECT STATUS UPDATED",
    status: 201
  });

  res.json(project);
};

/**
 * ADMIN: Assign employees
 */
const assignEmployees = async (req, res) => {
  const { userIds } = req.body;

  const records = userIds.map(userId => ({
    projectId: req.params.projectId,
    userId
  }));

  await ProjectMember.insertMany(records, { ordered: false });

  res.json({ message: "Employees assigned to project" });
};


/**
 * ADMIN: View all projects (groupable by status)
 */
const getAllProjects = async (req, res) => {
  const projects = await Project.find({
    organisationId: req.user.organisationId
  }).sort({ createdAt: -1 });

  res.json(projects);
};

/**
 * EMPLOYEE: View assigned projects
 */
const getEmployeeProjects = async (req, res) => {
  const memberships = await ProjectMember.find({
    userId: req.user.userId
  }).populate("projectId");

  const active = [];
  const completed = [];

  memberships.forEach(m => {
    if (m.projectId.status === "Active") active.push(m.projectId);
    if (m.projectId.status === "Completed") completed.push(m.projectId);
  });

  res.json({ active, completed });
};

module.exports = {
  createProject,
  updateProjectStatus,
  assignEmployees,
  getAllProjects,
  getEmployeeProjects
};
