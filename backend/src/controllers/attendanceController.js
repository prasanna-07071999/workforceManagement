const Attendance = require("../models/Attendance");
const User = require("../models/User");
const createLog = require("../utils/createLog");

// Helper: get today date (YYYY-MM-DD)
const getToday = () => new Date().toISOString().split("T")[0];

/**
 * EMPLOYEE: Check-in / Check-out
 */
const markAttendance = async (req, res) => {
  try {
    const userId = req.user.userId;
    const organisationId = req.user.organisationId;
    const today = getToday();

    let attendance = await Attendance.findOne({ userId, date: today });

    // FIRST CHECK-IN
    if (!attendance) {
      attendance = await Attendance.create({
        organisationId,
        userId,
        date: today,
        status: "Present",
        checkInTime: new Date()
      });

      await createLog({
        req,
        action: "POST /api/attendance/check-in",
        event: "ATTENDANCE CHECKIN",
        status: 201
      });

      return res.status(201).json({
        message: "Checked in successfully",
        attendance
      });
    }

    // CHECK-OUT
    if (!attendance.checkOutTime) {
      attendance.checkOutTime = new Date();
      await attendance.save();

      await createLog({
        req,
        action: "POST /api/attendance/check-out",
        event: "ATTENDANCE_CHECKOUT",
        status: 200
      });

      return res.json({
        message: "Checked out successfully",
        attendance
      });
    }

    return res.status(400).json({
      message: "Attendance already completed for today"
    });

  } catch (err) {
    console.error("markAttendance:", err);
    res.status(500).json({
      message: "Failed to mark attendance",
      error: err.message
    });
  }
};

/**
 * ADMIN: Today attendance list
 */
const getTodayAttendance = async (req, res) => {
  try {
    const today = getToday();
    const organisationId = req.user.organisationId;

    const attendance = await Attendance.find({
      organisationId,
      date: today
    }).populate("userId", "name email");

    res.json(attendance);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch today attendance",
      error: err.message
    });
  }
};

/**
 * ADMIN: Attendance summary (FIXED & COMPLETE)
 */
const getAttendanceSummary = async (req, res) => {
  try {
    const organisationId = req.user.organisationId;
    const today = getToday();

    // Total active employees (exclude admins)
    const totalEmployees = await User.countDocuments({
      organisationId,
      isAdmin: false,
      status: "Active"
    });

    // Present today
    const presentCount = await Attendance.countDocuments({
      organisationId,
      date: today,
      status: "Present"
    });

    // On leave today
    const leaveCount = await Attendance.countDocuments({
      organisationId,
      date: today,
      status: "Leave"
    });

    // Absent = total - (present + leave)
    const absentCount = Math.max(
      totalEmployees - (presentCount + leaveCount),
      0
    );

    res.json({
      date: today,
      present: presentCount,
      absent: absentCount,
      onLeave: leaveCount
    });

  } catch (err) {
    console.error("getAttendanceSummary:", err);
    res.status(500).json({
      message: "Failed to fetch attendance summary",
      error: err.message
    });
  }
};

module.exports = {
  markAttendance,
  getTodayAttendance,
  getAttendanceSummary
};