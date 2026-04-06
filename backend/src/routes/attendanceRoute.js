const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminOnly");

const {
  markAttendance,
  getTodayAttendance,
  getAttendanceSummary,
  getMyTodayAttendance,
  getMyMonthlyAttendance
} = require("../controllers/attendanceController");

// Employee marks attendance
router.post("/mark", authMiddleware, markAttendance);

// Admin views today attendance
router.get("/today", authMiddleware, adminOnly, getTodayAttendance);

// Admin summary
router.get("/summary", authMiddleware, adminOnly, getAttendanceSummary);

// Employee: get my today's attendance
router.get("/my/today", authMiddleware, getMyTodayAttendance);

// Employee: monthly attendance
router.get("/my/monthly", authMiddleware, getMyMonthlyAttendance);



module.exports = router