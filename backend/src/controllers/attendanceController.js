const Attendance = require("../models/Attendance");
const createLog = require("../utils/createLog");

// Helper: get today date
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

    // First time → CHECK-IN
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
        action: "ATTENDANCE_CHECKIN",
        event: "ATTENDANCE",
        status: 201,
        userId,
        organisationId
      });

      return res.status(201).json({
        message: "Checked in successfully",
        attendance
      });
    }

    // Already checked in → CHECK-OUT
    if (!attendance.checkOutTime) {
      attendance.checkOutTime = new Date();
      await attendance.save();

      await createLog({
        req,
        action: "ATTENDANCE_CHECKOUT",
        event: "ATTENDANCE",
        status: 200,
        userId,
        organisationId
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
 * ADMIN: Attendance summary
 */
const getAttendanceSummary = async (req, res) => {
  try {
    const organisationId = req.user.organisationId;
    const today = getToday();

    const presentCount = await Attendance.countDocuments({
      organisationId,
      date: today,
      status: "Present"
    });

    res.json({
      date: today,
      present: presentCount
    });
  } catch (err) {
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
