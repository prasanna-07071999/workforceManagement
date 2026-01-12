const Log = require("../models/Log");

const createLog = async ({
  req,
  action,
  event,
  status,
}) => {
  try {
    if (!req || !req.user){
      return;
    }
    const authUser = req.user;

    await Log.create({
      organisationId: authUser.organisationId,
      userId: authUser?.userId,
      action,
      event,
      status,
      ip:req.headers["x-forwarded-for"] || req.ip,
      timestamp: new Date()
    });
  } catch (err) {
    console.error("createLog error:", err.message);
  }
};

module.exports = createLog;
