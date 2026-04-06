const express = require('express')

const router = express.Router()

const {
    getallTeams,
    getTeamById,
    createTeam,
    updateTeam,
    deleteTeam,
    assignEmployees,
    unassignEmployees,
    getMyTeams
} = require('../controllers/teamController')

router.get('/', getallTeams)
router.get("/my", getMyTeams);
router.get('/:id', getTeamById)
router.post('/', createTeam)
router.put('/:id', updateTeam),
router.delete('/:id', deleteTeam)
router.post('/:teamId/assign', assignEmployees)
router.delete('/:teamId/unassign', unassignEmployees)

module.exports = router

