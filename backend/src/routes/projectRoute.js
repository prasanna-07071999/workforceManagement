const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminOnly");

const {
  createProject,
  updateProject,
  deleteProject,
  getProjectDetails,
  getAllProjects,
  getEmployeeProjects
} = require("../controllers/projectController");

// Admin
router.post("/", authMiddleware, adminOnly, createProject);
router.put("/:id", authMiddleware, adminOnly, updateProject);
router.delete("/:id", authMiddleware, adminOnly, deleteProject);
router.get("/", authMiddleware, adminOnly, getAllProjects);
router.get("/:id/details", authMiddleware, adminOnly, getProjectDetails);
router.get("/my", authMiddleware, getEmployeeProjects);

module.exports = router;
