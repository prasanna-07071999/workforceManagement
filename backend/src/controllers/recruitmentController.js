const Job = require("../models/Job");
const Candidate = require("../models/Candidate");
const createLog = require("../utils/createLog");

const createJob = async (req, res) => {
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
};

const getJobs = async (req, res) => {
  const jobs = await Job.find({
    organisationId: req.user.organisationId
  });
  res.json(jobs);
};

const addCandidate = async (req, res) => {
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
};

const updateCandidateStatus = async (req, res) => {
  const { status } = req.body;

  const candidate = await Candidate.findByIdAndUpdate(
    req.params.candidateId,
    { status },
    { new: true }
  );
  
  await createLog({
    req,
    action: `PUT /api/recruitment/candidates/:id/status`,
    event: "CANDIDATE_STATUS_UPDATED",
    status: 200
  });
  
  res.json(candidate);
};

const getHiredCandidates = async (req, res) => {
  const candidates = await Candidate.find({
    organisationId: req.user.organisationId,
    status: "Hired"
  }).populate("jobId", "title");

  res.json(candidates);
};
const updateJobStatus = async (req, res) => {
  const { status } = req.body;

  const job = await Job.findByIdAndUpdate(
    req.params.jobId,
    { status },
    { new: true }
  );

  await createLog({
    req,
    action: `PUT /api/recruitment/jobs/:id/status`,
    event: "JOB_STATUS_UPDATED",
    status: 200
  });

  res.json(job);
};


module.exports = {
  createJob,
  getJobs,
  addCandidate,
  updateCandidateStatus,
  getHiredCandidates,
  updateJobStatus
};
