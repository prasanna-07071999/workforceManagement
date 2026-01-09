const Employee = require('../models/Employee')
const Team = require('../models/Team')
const User = require('../models/User')

const getStatsSummary = async (req, res) => {
  try {
    const totalEmployees = await Employee.countDocuments({ organisationId: req.user.organisationId });
    const totalTeams = await Team.countDocuments({ organisationId: req.user.organisationId });
    const totalAdmins = await User.countDocuments({ organisationId: req.user.organisationId, isAdmin: true });

    res.json({ totalEmployees, totalTeams, totalAdmins });
  } catch (err) {
    console.error("stats summary:", err);
    res.status(500).json({ message: "Failed to load stats", error: err.message });
  }
}

module.exports = {
    getStatsSummary
}