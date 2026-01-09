const User = require("../models/User");
const createLog = require("../utils/createLog");

const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    if (!["Active", "Inactive", "Resigned"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status value"
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.status = status;
    await user.save();

    await createLog({
      req,
      action: `USER_STATUS_${status.toUpperCase()}`,
      event: "USER",
      status: 200,
      userId: req.user.userId,
      organisationId: req.user.organisationId
    });

    res.json({
      message: `User status updated to ${status}`,
      user
    });
  } catch (err) {
    console.error("updateUserStatus:", err);
    res.status(500).json({
      message: "Failed to update user status",
      error: err.message
    });
  }
};

module.exports = {
  updateUserStatus
};
