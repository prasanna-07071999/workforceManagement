const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminOnly");

const {
  createProject,
  updateProjectStatus,
  assignEmployees,
  getAllProjects,
  getEmployeeProjects
} = require("../controllers/projectController");

// Admin
router.post("/", authMiddleware, adminOnly, createProject);
router.patch("/:projectId/status", authMiddleware, adminOnly, updateProjectStatus);
router.post("/:projectId/assign", authMiddleware, adminOnly, assignEmployees);
router.get("/", authMiddleware, adminOnly, getAllProjects);

// Employee
router.get("/my", authMiddleware, getEmployeeProjects);

module.exports = router;
