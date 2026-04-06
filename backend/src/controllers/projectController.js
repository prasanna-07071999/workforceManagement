const Project = require("../models/Projects");
const ProjectMember = require("../models/ProjectMember");
const Team = require("../models/Team");
const EmployeeTeam = require("../models/EmployeeTeam");
const createLog = require("../utils/createLog");
const Employee = require('../models/Employee')

// ADMIN: Create project (with team)
const createProject = async (req, res) => {
  try {
    const { name, description, status, startDate, endDate, teamId } = req.body;

    if (!name || !teamId) {
      return res.status(400).json({ message: "Project name and team required" });
    }

    const project = await Project.create({
      organisationId: req.user.organisationId,
      name,
      description,
      status,
      startDate,
      endDate,
      teamId
    });

    // auto-assign team members to project
    const teamMembers = await EmployeeTeam.find({ teamId });
    if (teamMembers.length) {
      await ProjectMember.insertMany(
        teamMembers.map(m => ({
          projectId: project._id,
          userId: m.employeeId
        })),
        { ordered: false }
      );
    }

    await createLog({
      req,
      action: "POST /api/projects",
      event: "PROJECT_CREATED",
      status: 201,
      projectId: project._id
    });

    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: "Failed to create project" });
  }
};

// ADMIN: Update project (FULL EDIT)
 
const updateProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    await createLog({
      req,
      action: "PUT /api/projects/:id",
      event: "PROJECT_UPDATED",
      status: 200,
      projectId: project._id
    });

    res.json(project);
  } catch {
    res.status(500).json({ message: "Failed to update project" });
  }
};

// ADMIN: Delete project

const deleteProject = async (req, res) => {
  try {
    await ProjectMember.deleteMany({ projectId: req.params.id });
    await Project.deleteOne({ _id: req.params.id });

    await createLog({
      req,
      action: "DELETE /api/projects/:id",
      event: "PROJECT_DELETED",
      status: 200,
      projectId: req.params.id
    });

    res.json({ message: "Project deleted successfully" });
  } catch {
    res.status(500).json({ message: "Failed to delete project" });
  }
};

// ADMIN: Project details (popup)
const getProjectDetails = async (req, res) => {
  const project = await Project.findById(req.params.id).populate("teamId");
  const teamMembers = await EmployeeTeam.find({ teamId: project.teamId._id })
    .populate("employeeId");

  res.json({ project, teamMembers });
};

// ADMIN: View all projects
const getAllProjects = async (req, res) => {
  const projects = await Project.find({
    organisationId: req.user.organisationId
  }).populate("teamId");

  res.json(projects);
};


//EMPLOYEE: View assigned projects

const getEmployeeProjects = async (req, res) => {
  try {
    // 1️⃣ Find employee record for logged-in user
    const employee = await Employee.findOne({
      userId: req.user.userId,
      organisationId: req.user.organisationId
    });

    if (!employee) {
      return res.json([]);
    }

    // 2️⃣ Find teams assigned to this employee
    const teamMappings = await EmployeeTeam.find({
      employeeId: employee._id
    });

    const teamIds = teamMappings.map(t => t.teamId);

    if (teamIds.length === 0) {
      return res.json([]);
    }

    // 3️⃣ Find projects linked to those teams
    const projects = await Project.find({
      organisationId: req.user.organisationId,
      teamId: { $in: teamIds }
    }).sort({ createdAt: -1 });

    res.json(projects);
  } catch (err) {
    console.error("getEmployeeProjects:", err);
    res.status(500).json({
      message: "Failed to load employee projects",
      error: err.message
    });
  }
};



module.exports = {
  createProject,
  updateProject,
  deleteProject,
  getProjectDetails,
  getAllProjects,
  getEmployeeProjects
};