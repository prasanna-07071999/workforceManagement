const DailyUpdate = require("../models/DialyUpdate");
const User = require("../models/User");
const createLog = require("../utils/createLog");

const getToday = () => new Date().toISOString().split("T")[0];

/**
 * EMPLOYEE: Submit
 */
const submitDailyUpdate = async (req, res) => {
  try {
    const { description } = req.body;

    if (!description) {
      return res.status(400).json({ message: "description required" });
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
      action: "POST /api/dialy-updates",
      event: "DAILY_UPDATE_SUBMITTED",
      status: 201
    });

    res.status(201).json({ message: "Submitted", update });

  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        message: "Already submitted today"
      });
    }

    res.status(500).json({ message: err.message });
  }
};

/**
 * EMPLOYEE: My updates
 */
const getMyDailyUpdates = async (req, res) => {
  try {
    const updates = await DailyUpdate.find({
      userId: req.user.userId
    }).sort({ date: -1 });

    res.json(updates);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ADMIN: All updates + summary + missing

const getAllDailyUpdates = async (req, res) => {
  try {
    const organisationId = req.user.organisationId;
    const today = getToday();

    const updates = await DailyUpdate.find({
      organisationId
    })
      .populate("userId", "name email")
      .sort({ date: -1 });

    const todayUpdates = await DailyUpdate.find({
      organisationId,
      date: today
    }).populate("userId", "_id"); 

    const submittedUserIds = todayUpdates.map(
      u => u.userId._id.toString()
    );

    const employees = await User.find({
      organisationId,
      isAdmin: false,
      status: "Active"
    });

  
    const missing = employees.filter(
      e => !submittedUserIds.includes(e._id.toString())
    );

    res.json({
      updates,
      summary: {
        totalEmployees: employees.length,
        submitted: todayUpdates.length,
        missing: missing.length
      },
      missingEmployees: missing.map(e => ({
        name: e.name,
        email: e.email
      }))
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  submitDailyUpdate,
  getMyDailyUpdates,
  getAllDailyUpdates
};