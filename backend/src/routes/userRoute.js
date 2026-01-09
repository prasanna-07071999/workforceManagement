const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminOnly");

const { updateUserStatus } = require("../controllers/userController");

router.patch("/:userId/status", authMiddleware, adminOnly, updateUserStatus);

module.exports = router;
