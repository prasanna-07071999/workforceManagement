const DailyUpdate = require("../models/DialyUpdate");
const createLog = require("../utils/createLog");

// Helper
const getToday = () => new Date().toISOString().split("T")[0];

/**
 * EMPLOYEE: Submit daily update
 */
const submitDailyUpdate = async (req, res) => {
  try {
    const { description } = req.body;
    if (!description) {
      return res.status(400).json({
        message: "description is required"
      });
    }

    const today = getToday();

    const update = await DailyUpdate.create({
      organisationId: req.user.organisationId,
      userId: req.user.userId,
      date: today,
      description
    });

    await createLog({
      req,
      action: "DAILY_UPDATE_SUBMITTED",
      event: "DAILY_UPDATE",
      status: 201,
      userId: req.user.userId,
      organisationId: req.user.organisationId
    });

    res.status(201).json({
      message: "Daily update submitted",
      update
    });
  } catch (err) {
    console.error("submitDailyUpdate:", err);

    // Duplicate update protection
    if (err.code === 11000) {
      return res.status(409).json({
        message: "Daily update already submitted for today"
      });
    }

    res.status(500).json({
      message: "Failed to submit daily update",
      error: err.message
    });
  }
};

/**
 * EMPLOYEE: View own daily updates
 */
const getMyDailyUpdates = async (req, res) => {
  try {
    const updates = await DailyUpdate.find({
      userId: req.user.userId
    }).sort({ date: -1 });

    res.json(updates);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch daily updates",
      error: err.message
    });
  }
};

/**
 * ADMIN: View all daily updates
 */
const getAllDailyUpdates = async (req, res) => {
  try {
    const updates = await DailyUpdate.find({
      organisationId: req.user.organisationId
    })
      .populate("userId", "name email")
      .sort({ date: -1 });

    res.json(updates);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch all daily updates",
      error: err.message
    });
  }
};

module.exports = {
  submitDailyUpdate,
  getMyDailyUpdates,
  getAllDailyUpdates
};
