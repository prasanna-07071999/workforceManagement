const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminOnly");

const {
  markAttendance,
  getTodayAttendance,
  getAttendanceSummary
} = require("../controllers/attendanceController");

// Employee marks attendance
router.post("/mark", authMiddleware, markAttendance);

// Admin views today attendance
router.get("/today", authMiddleware, adminOnly, getTodayAttendance);

// Admin summary
router.get("/summary", authMiddleware, adminOnly, getAttendanceSummary);

module.exports = router