const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminOnly");

const {
  createHoliday,
  getHolidays,
  deleteHoliday
} = require("../controllers/holidayController");

// Admin only
router.post("/", authMiddleware, adminOnly, createHoliday);
router.get("/", authMiddleware, adminOnly, getHolidays);
router.delete("/:holidayId", authMiddleware, adminOnly, deleteHoliday);

module.exports = router;
