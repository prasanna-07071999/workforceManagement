const Job = require("../models/Job");
const Candidate = require("../models/Candidate");
const createLog = require("../utils/createLog");

// ✅ CREATE JOB
const createJob = async (req, res) => {
  try {
    const job = await Job.create({
      organisationId: req.user.organisationId,
      ...req.body
    });

    await createLog({
      req,
      action: "POST /api/recruitment/jobs",
      event: "JOB_CREATED",
      status: 201
    });

    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ GET JOBS WITH APPLICATION COUNT
const getJobs = async (req, res) => {
  try {
    const jobs = await Job.aggregate([
      {
        $match: {
          organisationId: req.user.organisationId
        }
      },
      {
        $lookup: {
          from: "candidates",
          localField: "_id",
          foreignField: "jobId",
          as: "applications"
        }
      },
      {
        $addFields: {
          applicationsCount: { $size: "$applications" }
        }
      },
      {
        $project: {
          applications: 0
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ]);

    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ ADD CANDIDATE
const addCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.create({
      organisationId: req.user.organisationId,
      ...req.body
    });

    await createLog({
      req,
      action: "POST /api/recruitment/candidates",
      event: "CANDIDATE_ADDED",
      status: 201
    });

    res.status(201).json(candidate);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ UPDATE CANDIDATE STATUS
const updateCandidateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const candidate = await Candidate.findByIdAndUpdate(
      req.params.candidateId,
      { status },
      { new: true }
    );

    await createLog({
      req,
      action: "PUT /api/recruitment/candidates/:id/status",
      event: "CANDIDATE_STATUS_UPDATED",
      status: 200
    });

    res.json(candidate);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ GET HIRED CANDIDATES
const getHiredCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find({
      organisationId: req.user.organisationId,
      status: "Hired"
    }).populate("jobId", "title");

    res.json(candidates);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ UPDATE JOB STATUS
const updateJobStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const job = await Job.findByIdAndUpdate(
      req.params.jobId,
      { status },
      { new: true }
    );

    await createLog({
      req,
      action: "PUT /api/recruitment/jobs/:id/status",
      event: "JOB_STATUS_UPDATED",
      status: 200
    });

    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createJob,
  getJobs,
  addCandidate,
  updateCandidateStatus,
  getHiredCandidates,
  updateJobStatus
}