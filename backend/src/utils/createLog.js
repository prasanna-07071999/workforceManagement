const Log = require('../models/Log')

const createLog = async ({ req, action, event, status, organisationId, userId }) => {
  try {
    const user = (req && req.user) ? req.user : null;
    await Log.create({
      organisationId: organisationId || (user ? user.organisationId : null),
      userId: userId || (user ? user.id : null),
      action: action || `${req ? req.method + " " + req.originalUrl : "SYSTEM"}`,
      event: event || null,
      status: status || (req && req.res ? req.res.statusCode : null),
      ip: req ? (req.headers["x-forwarded-for"] || req.ip || "") : null,
      timestamp: new Date()
    });
  } catch (err) {
    console.error("createLog error:", err.message);
  }
};

module.exports = createLog