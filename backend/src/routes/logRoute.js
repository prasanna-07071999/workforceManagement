const express = require('express')
const router = express.Router()
const {getLogs} = require('../controllers/logController');
const adminonly = require('../middleware/adminOnly')

router.get("/", adminonly, getLogs);

module.exports = router