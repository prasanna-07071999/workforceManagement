const Leave = require("../models/Leave");
const createLog = require("../utils/createLog");

/**
 * EMPLOYEE: Apply leave
 */
const applyLeave = async (req, res) => {
  try {
    const { fromDate, toDate, reason } = req.body;

    if (!fromDate || !toDate || !reason) {
      return res.status(400).json({
        message: "fromDate, toDate and reason are required"
      });
    }

    const leave = await Leave.create({
      organisationId: req.user.organisationId,
      userId: req.user.userId,
      fromDate,
      toDate,
      reason
    });

    await createLog({
      req,
      action: "LEAVE_APPLIED",
      event: "LEAVE",
      status: 201,
      userId: req.user.userId,
      organisationId: req.user.organisationId
    });

    res.status(201).json({
      message: "Leave applied successfully",
      leave
    });
  } catch (err) {
    console.error("applyLeave:", err);
    res.status(500).json({
      message: "Failed to apply leave",
      error: err.message
    });
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

/**
 * ADMIN: Approve / Reject leave
 */
const updateLeaveStatus = async (req, res) => {
  try {
    const { leaveId } = req.params;
    const { status } = req.body;

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({
        message: "Status must be Approved or Rejected"
      });
    }

    const leave = await Leave.findById(leaveId);
    if (!leave) {
      return res.status(404).json({ message: "Leave not found" });
    }

    leave.status = status;
    leave.approvedBy = req.user.userId;
    leave.approvedAt = new Date();

    await leave.save();

    await createLog({
      req,
      action: `LEAVE_${status.toUpperCase()}`,
      event: "LEAVE",
      status: 200,
      userId: req.user.userId,
      organisationId: req.user.organisationId
    });

    res.json({
      message: `Leave ${status.toLowerCase()} successfully`,
      leave
    });
  } catch (err) {
    console.error("updateLeaveStatus:", err);
    res.status(500).json({
      message: "Failed to update leave status",
      error: err.message
    });
  }
};

module.exports = {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  updateLeaveStatus
}