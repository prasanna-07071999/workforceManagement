const express = require('express')

const router = express.Router()
const adminOnly = require('../middleware/adminOnly')
const authMiddleware = require('../middleware/authMiddleware')
const {getAllEmployees, getEmployeeById, createEmployee, updateEmployee, deleteEmployee} = require('../controllers/employeeController')


router.get('/', authMiddleware, getAllEmployees)
router.get('/:id', authMiddleware, getEmployeeById)

router.post('/', adminOnly, createEmployee)
router.put('/:id', adminOnly, updateEmployee)
router.delete('/:id', adminOnly, deleteEmployee)

module.exports = router