const Attendance = require("../models/Attendance");
const User = require("../models/User");
const Holiday = require("../models/Holiday"); // ✅ NEW
const createLog = require("../utils/createLog");

const getToday = () => new Date().toISOString().split("T")[0];

// ✅ HELPER: check holiday
const checkIfHoliday = async (organisationId) => {
  const today = new Date();
  today.setHours(0,0,0,0);

  return await Holiday.findOne({
    organisationId,
    $or: [
      { date: today },
      {
        isRecurring: true,
        month: today.getMonth(),
        day: today.getDate()
      }
    ]
  });
};

/**
 * EMPLOYEE: Check-in / Check-out
 */
const markAttendance = async (req, res) => {
  try {
    const userId = req.user.userId;
    const organisationId = req.user.organisationId;
    const today = getToday();

    // ✅ HOLIDAY CHECK
    const holiday = await checkIfHoliday(organisationId);
    if (holiday) {
      return res.status(400).json({
        message: `Today is ${holiday.name}. Holiday!`
      });
    }

    let attendance = await Attendance.findOne({ userId, date: today });

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

    const holiday = await checkIfHoliday(organisationId);

    if (holiday) {
      return res.json({
        isHoliday: true,
        holidayName: holiday.name,
        list: []
      });
    }

    const attendance = await Attendance.find({
      organisationId,
      date: today
    }).populate("userId", "name email");

    res.json(attendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * ADMIN: Summary
 */
const getAttendanceSummary = async (req, res) => {
  try {
    const organisationId = req.user.organisationId;
    const today = getToday();

    const holiday = await checkIfHoliday(organisationId);

    const totalEmployees = await User.countDocuments({
      organisationId,
      isAdmin: false,
      status: "Active"
    });

    if (holiday) {
      return res.json({
        date: today,
        present: 0,
        absent: 0,
        onLeave: 0,
        holiday: totalEmployees // ✅ everyone holiday
      });
    }

    const presentCount = await Attendance.countDocuments({
      organisationId,
      date: today,
      status: "Present"
    });

    const leaveCount = await Attendance.countDocuments({
      organisationId,
      date: today,
      status: "Leave"
    });

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
    res.status(500).json({ message: err.message });
  }
};

/**
 * EMPLOYEE: Today
 */
const getMyTodayAttendance = async (req, res) => {
  try {
    const organisationId = req.user.organisationId;
    const userId = req.user.userId;
    const today = getToday();

    const holiday = await checkIfHoliday(organisationId);

    if (holiday) {
      return res.json({
        isHoliday: true,
        holidayName: holiday.name
      });
    }

    const attendance = await Attendance.findOne({
      userId,
      date: today
    });

    res.json(attendance || null);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * EMPLOYEE: Monthly
 */
const getMyMonthlyAttendance = async (req, res) => {
  try {
    const { month } = req.query;
    const organisationId = req.user.organisationId;
    const userId = req.user.userId;

    const records = await Attendance.find({
      organisationId,
      userId,
      date: { $regex: `^${month}` }
    }).sort({ date: 1 });

    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  markAttendance,
  getTodayAttendance,
  getAttendanceSummary,
  getMyTodayAttendance,
  getMyMonthlyAttendance
};