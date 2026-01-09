const Log = require('../models/Log')

const getLogs = async (req, res) => {
  try {
    const logs = await Log.find()
      .populate("userId", "name email")
      .populate("organisationId", "name")
      .sort({ timestamp: -1 })
      .limit(1000);

    res.json({ success: true, count: logs.length, logs });
  } catch (err) {
    console.error("getLogs:", err);
    res.status(500).json({ message: "Failed to fetch logs", error: err.message });
  }
}

module.exports = { getLogs };
