const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminOnly");

const {
  createJob,
  getJobs,
  addCandidate,
  updateCandidateStatus,
  getHiredCandidates,
  updateJobStatus,
  updateJob,
  deleteJob
} = require("../controllers/recruitmentController");

// JOBS
router.post("/jobs", authMiddleware, adminOnly, createJob);
router.get("/jobs", authMiddleware, adminOnly, getJobs);
router.patch("/jobs/:jobId/status", authMiddleware, adminOnly, updateJobStatus);
router.put("/jobs/:jobId", authMiddleware, adminOnly, updateJob); 
router.delete("/jobs/:jobId", authMiddleware, adminOnly, deleteJob);

// CANDIDATES
router.post("/candidates", authMiddleware, adminOnly, addCandidate);
router.patch("/candidates/:candidateId/status", authMiddleware, adminOnly, updateCandidateStatus);
router.get("/candidates/hired", authMiddleware, adminOnly, getHiredCandidates);

module.exports = router