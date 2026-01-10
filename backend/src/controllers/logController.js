const Log = require('../models/Log')

const getLogs = async (req, res) => {
  try {
    const logs = await Log.find()
      .populate("userId", "name email")
      .populate("organisationId", "name")
      .sort({ createdAt: -1 })
      .limit(1000);

    const normalizedLogs = logs.map(log => ({
      _id: log._id,
      timestamp: log.timestamp,
      action: log.action,
      event: log.event || "SYSTEM",
      status: log.status ?? "--",
      ip: log.ip ?? "--",
      user: log.userId
        ? {
            name: log.userId.name,
            email: log.userId.email
          }
        : {
            name: "System",
            email: "--"
          },
      organisation: log.organisationId
        ? log.organisationId.name
        : "System",
    }));

    res.json({
      success: true,
      count: normalizedLogs.length,
      logs: normalizedLogs
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch logs" });
  }
};

module.exports = { getLogs };
