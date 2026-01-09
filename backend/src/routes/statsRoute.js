const express = require('express')
const router = express.Router()
const {getStatsSummary} = require('../controllers/statsController')
const authMiddleware = require('../middleware/authMiddleware')

router.get("/summary", authMiddleware, getStatsSummary );

module.exports = router