const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminOnly");

const {
  createJob,
  getJobs,
  addCandidate,
  updateCandidateStatus,
  getHiredCandidates
} = require("../controllers/recruitmentController");

router.post("/jobs", authMiddleware, adminOnly, createJob);
router.get("/jobs", authMiddleware, adminOnly, getJobs);

router.post("/candidates", authMiddleware, adminOnly, addCandidate);
router.patch("/candidates/:candidateId/status", authMiddleware, adminOnly, updateCandidateStatus);

router.get("/candidates/hired", authMiddleware, adminOnly, getHiredCandidates);

module.exports = router;