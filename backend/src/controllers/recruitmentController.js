const Job = require("../models/Job");
const Candidate = require("../models/Candidate");
const createLog = require("../utils/createLog");

const createJob = async (req, res) => {
  const job = await Job.create({
    organisationId: req.user.organisationId,
    ...req.body
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
  res.status(201).json(candidate);
};

const updateCandidateStatus = async (req, res) => {
  const { status } = req.body;

  const candidate = await Candidate.findByIdAndUpdate(
    req.params.candidateId,
    { status },
    { new: true }
  );

  res.json(candidate);
};

const getHiredCandidates = async (req, res) => {
  const candidates = await Candidate.find({
    organisationId: req.user.organisationId,
    status: "Hired"
  }).populate("jobId", "title");

  res.json(candidates);
};

module.exports = {
  createJob,
  getJobs,
  addCandidate,
  updateCandidateStatus,
  getHiredCandidates
};
