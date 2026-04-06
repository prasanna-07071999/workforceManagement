const Leave = require("../models/Leave");
const createLog = require("../utils/createLog");

const Attendance = require("../models/Attendance");

const applyLeave = async (req, res) => {
  try {
    const { fromDate, toDate, reason, leaveType } = req.body;

    if (!fromDate || !toDate || !reason) {
      return res.status(400).json({ message: "All fields required" });
    }

    // ❌ Prevent overlapping leaves
    const overlap = await Leave.findOne({
      userId: req.user.userId,
      status: { $ne: "Rejected" },
      $or: [
        { fromDate: { $lte: toDate }, toDate: { $gte: fromDate } }
      ]
    });

    if (overlap) {
      return res.status(400).json({
        message: "Overlapping leave already exists"
      });
    }

    const leave = await Leave.create({
      organisationId: req.user.organisationId,
      userId: req.user.userId,
      fromDate,
      toDate,
      reason,
      leaveType
    });

    await createLog({
      req,
      action: "POST /api/leaves",
      event: "LEAVE_APPLIED",
      status: 201
    });

    res.status(201).json({ message: "Leave applied", leave });
  } catch (err) {
    res.status(500).json({ message: "Failed to apply leave" });
  }
};


/**
 * EMPLOYEE: View own leaves
 */
const getMyLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({
      userId: req.user.userId
    }).sort({ createdAt: -1 });

    res.json(leaves);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch leaves",
      error: err.message
    });
  }
};

/**
 * ADMIN: View all leave requests
 */
const getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({
      organisationId: req.user.organisationId
    })
      .populate("userId", "name email")
      .populate("approvedBy", "name")
      .sort({ createdAt: -1 });

    res.json(leaves);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch all leaves",
      error: err.message
    });
  }
};

//Approve or reject leave (Admin)

const updateLeaveStatus = async (req, res) => {
  try {
    const { leaveId } = req.params;
    const { status } = req.body;

    const leave = await Leave.findById(leaveId);
    if (!leave) return res.status(404).json({ message: "Leave not found" });

    // 🚫 Admin cannot approve own leave
    if (leave.userId.toString() === req.user.userId) {
      return res.status(403).json({
        message: "You cannot approve or reject your own leave"
      });
    }

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    leave.status = status;
    leave.approvedBy = req.user.userId;
    leave.approvedAt = new Date();
    await leave.save();

    // ✅ If approved → mark attendance
    if (status === "Approved") {
      const dates = getDatesBetween(leave.fromDate, leave.toDate);

      for (const date of dates) {
        await Attendance.findOneAndUpdate(
          { userId: leave.userId, date },
          {
            organisationId: leave.organisationId,
            userId: leave.userId,
            date,
            status: "Leave"
          },
          { upsert: true }
        );
      }
    }

    await createLog({
      req,
      action: "PATCH /api/leaves/:id/status",
      event: "LEAVE_UPDATED",
      status: 200
    });

    res.json({ message: `Leave ${status.toLowerCase()}`, leave });
  } catch (err) {
    res.status(500).json({ message: "Failed to update leave" });
  }
};

// const rejectLeave = async (req, res) => {
//   const { comment } = req.body;
//   const leave = await Leave.findById(req.params.id);

//   if (!leave) return res.status(404).json({ message: "Leave not found" });

//   if (leave.userId.toString() === req.user.userId) {
//     return res.status(403).json({ message: "Cannot reject your own leave" });
//   }

//   leave.status = "Rejected";
//   leave.adminComment = comment;
//   leave.approvedBy = req.user.userId;

//   await leave.save();

//   res.json({ message: "Leave rejected" });
// };

/* ================= HELPER ================= */
function getDatesBetween(start, end) {
  const dates = [];
  let current = new Date(start);
  const last = new Date(end);

  while (current <= last) {
    dates.push(current.toISOString().slice(0, 10));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

module.exports = {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  updateLeaveStatus,
}