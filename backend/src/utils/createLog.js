const Log = require("../models/Log");

const getClientIp = (req) => {
  if (!req) return null;

  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    return forwarded.split(",")[0].trim(); // ✅ FIRST IP ONLY
  }

  return req.ip || null;
};

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
      ip:getClientIp(req),
      timestamp: new Date()
    });
  } catch (err) {
    console.error("createLog error:", err.message);
  }
};

module.exports = createLog;
