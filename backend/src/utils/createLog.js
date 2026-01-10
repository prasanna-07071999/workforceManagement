const Log = require("../models/Log");

const createLog = async ({
  req,
  action,
  event = "SYSTEM",
  status,
  organisationId,
  userId,
}) => {
  try {
    const authUser = req?.user;

    await Log.create({
      organisationId:
        organisationId ??
        authUser?.organisationId ??
        null,

      userId:
        userId ??
        authUser?.userId ??
        null,

      action:
        action ??
        `${req?.method ?? "SYSTEM"} ${req?.originalUrl ?? ""}`,

      event,

      status:
        status ??
        req?.res?.statusCode ??
        null,

      ip:
        req?.headers?.["x-forwarded-for"] ??
        req?.ip ??
        null,
    });
  } catch (err) {
    console.error("createLog error:", err.message);
  }
};

module.exports = createLog;
