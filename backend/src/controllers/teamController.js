const mongoose = require('mongoose')
const Team = require('../models/Team')
const Employee = require('../models/Employee')
const EmployeeTeam = require('../models/EmployeeTeam')
const createLog = require('../utils/createLog')

const {Types} = mongoose


const checkOrgOwnershipTeam = (req, team) => team.organisationId.toString() === req.user.organisationId;

const getallTeams = async (req, res) => {
    try {
        const teams = await Team.find({ organisationId: req.user.organisationId });
        res.json(teams);
    } catch (err) {
        console.error("getAllTeams:", err);
        res.status(500).json({ message: "Failed to fetch teams", error: err.message });
    }
};

const getTeamById = async (req, res) => {
    try {
        const team = await Team.findById(req.params.id);
        if (!team || !checkOrgOwnershipTeam(req, team)) {
        return res.status(404).json({ message: "Team Not Found" });
        }
        res.json(team);
    } catch (err) {
        console.error("getTeamById:", err);
        res.status(500).json({ message: "Failed to fetch team", error: err.message });
    }
}

const createTeam =  async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name) return res.status(400).json({ message: "name required" });

        const team = await Team.create({
        organisationId: req.user.organisationId,
        name,
        description
        });

        await createLog({
        req,
        action: "POST /api/teams",
        event: "TEAM_CREATED",
        status: 201,
        teamId: team._id
        });

        res.status(201).json(team);
    } catch (err) {
        console.error("createTeam:", err);
        res.status(500).json({ message: "Failed to create team", error: err.message });
    }
}

const updateTeam = async (req, res) => {
    try {
        const team = await Team.findById(req.params.id);
        if (!team || !checkOrgOwnershipTeam(req, team)) return res.status(404).json({ message: "Team Not Found" });

        Object.assign(team, req.body);
        await team.save();

        await createLog({
        req,
        action: "PUT /api/teams/:id",
        event: "TEAM_UPDATED",
        status: 200,
        teamId: team._id
        });

        res.json(team);
    } catch (err) {
        console.error("updateTeam:", err);
        res.status(500).json({ message: "Failed to update team", error: err.message });
    }
}

const deleteTeam = async (req, res) => {
    try {
        const team = await Team.findById(req.params.id);
        if (!team || !checkOrgOwnershipTeam(req, team)) return res.status(404).json({ message: "Team Not Found" });

        // remove employee-team mappings for this team
        await EmployeeTeam.deleteMany({ teamId: team._id });

        await Team.deleteOne({ _id: team._id });

        await createLog({
        req,
        action: "DELETE /api/teams/:id",
        event: "TEAM_DELETED",
        status: 200,
        teamId: team._id
        });

        res.json({ message: "Team deleted successfully" });
    } catch (err) {
        console.error("deleteTeam:", err);
        res.status(500).json({ message: "Failed to delete team", error: err.message });
    }
}

// Assign employees to a team (single or multiple)
const assignEmployees = async (req, res) => {
    try {
        const { employeeId, employeeIds } = req.body;
        const ids = employeeIds || (employeeId ? [employeeId] : []);
        if (!ids.length) return res.status(400).json({ message: "No employee IDs provided" });

        const team = await Team.findById(req.params.teamId);
        if (!team || !checkOrgOwnershipTeam(req, team)) return res.status(404).json({ message: "Team not found" });

        const objectIds = ids.map((id) => new Types.ObjectId(id));
        const validEmployees = await Employee.find({
        _id: { $in: objectIds },
        organisationId: req.user.organisationId
        });

        const ops = validEmployees.map((e) =>
        EmployeeTeam.updateOne(
            { employeeId: e._id, teamId: team._id },
            { $setOnInsert: { assignedAt: new Date() } },
            { upsert: true }
        )
        );
        await Promise.all(ops);

        await createLog({
        req,
        action: "POST /api/teams/:teamId/assign",
        event: "TEAM_EMPLOYEES_ASSIGNED",
        status: 200,
        teamId: team._id
        });

        res.json({ message: "Employees assigned successfully" });
    } catch (err) {
        console.error("assignEmployees:", err);
        res.status(500).json({ message: "Failed to assign employees", error: err.message });
    }
}

// Unassign employee from team
const unassignEmployees =  async (req, res) => {
    try {
        const { employeeId } = req.body;
        if (!employeeId) return res.status(400).json({ message: "Employee ID required" });

        const team = await Team.findById(req.params.teamId);
        if (!team || !checkOrgOwnershipTeam(req, team)) return res.status(404).json({ message: "Team not found" });

        await EmployeeTeam.deleteOne({ teamId: team._id, employeeId: new Types.ObjectId(employeeId) });

        await createLog({
        req,
        action: "POST /api/teams/:teamId/unassign",
        event: "TEAM_EMPLOYEE_UNASSIGNED",
        status: 200,
        teamId: team._id
        });

        res.json({ message: "Employee unassigned successfully" });
    } catch (err) {
        console.error("unassignEmployee:", err);
        res.status(500).json({ message: "Failed to unassign employee", error: err.message });
    }
}

module.exports = {
    getallTeams,
    getTeamById,
    createTeam,
    updateTeam,
    deleteTeam,
    assignEmployees,
    unassignEmployees
}
