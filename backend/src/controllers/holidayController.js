const Holiday = require("../models/Holiday");
const createLog = require("../utils/createLog");

/**
 * ADMIN: Create holiday
 */
const createHoliday = async (req, res) => {
  try {
    const { date, name } = req.body;

    if (!date || !name) {
      return res.status(400).json({
        message: "date and name are required"
      });
    }

    const holiday = await Holiday.create({
      organisationId: req.user.organisationId,
      date,
      name
    });

    await createLog({
      req,
      action: "HOLIDAY_CREATED",
      event: "HOLIDAY",
      status: 201,
      userId: req.user.userId,
      organisationId: req.user.organisationId
    });

    res.status(201).json({
      message: "Holiday created successfully",
      holiday
    });
  } catch (err) {
    console.error("createHoliday:", err);

    if (err.code === 11000) {
      return res.status(409).json({
        message: "Holiday already exists for this date"
      });
    }

    res.status(500).json({
      message: "Failed to create holiday",
      error: err.message
    });
  }
};

/**
 * ADMIN: Get all holidays
 */
const getHolidays = async (req, res) => {
  try {
    const holidays = await Holiday.find({
      organisationId: req.user.organisationId
    }).sort({ date: 1 });

    res.json(holidays);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch holidays",
      error: err.message
    });
  }
};

/**
 * ADMIN: Delete holiday
 */
const deleteHoliday = async (req, res) => {
  try {
    const { holidayId } = req.params;

    const holiday = await Holiday.findById(holidayId);
    if (!holiday) {
      return res.status(404).json({ message: "Holiday not found" });
    }

    await holiday.deleteOne();

    await createLog({
      req,
      action: "HOLIDAY_DELETED",
      event: "HOLIDAY",
      status: 200,
      userId: req.user.userId,
      organisationId: req.user.organisationId
    });

    res.json({ message: "Holiday deleted successfully" });
  } catch (err) {
    res.status(500).json({
      message: "Failed to delete holiday",
      error: err.message
    });
  }
};

module.exports = {
  createHoliday,
  getHolidays,
  deleteHoliday
};
