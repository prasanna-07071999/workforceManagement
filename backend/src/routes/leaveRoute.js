const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminOnly");

const {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  updateLeaveStatus
} = require("../controllers/leaveController");

// Employee
router.post("/", authMiddleware, applyLeave);
router.get("/my", authMiddleware, getMyLeaves);

// Admin
router.get("/", authMiddleware, adminOnly, getAllLeaves);
router.patch("/:leaveId/status", authMiddleware, adminOnly, updateLeaveStatus);

module.exports = router