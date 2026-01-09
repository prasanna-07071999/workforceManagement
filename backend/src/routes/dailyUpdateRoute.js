const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminOnly");

const {
  submitDailyUpdate,
  getMyDailyUpdates,
  getAllDailyUpdates
} = require("../controllers/dialyUpdateController");

// Employee
router.post("/", authMiddleware, submitDailyUpdate);
router.get("/my", authMiddleware, getMyDailyUpdates);

// Admin
router.get("/", authMiddleware, adminOnly, getAllDailyUpdates);

module.exports = router;
