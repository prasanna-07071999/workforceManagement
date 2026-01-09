const Employee = require('../models/Employee')
const createLog = require('../utils/createLog')
const User = require("../models/User");
const bcrypt = require("bcrypt");

const checkOrgOwnershipEmployee = (req, employee) =>
  employee.organisationId.toString() === req.user.organisationId;

const getAllEmployees =  async (req, res) => {
  try {
    const employees = await Employee.find({ organisationId: req.user.organisationId });
    res.json(employees);
  } catch (err) {
    console.error("getAllEmployees:", err);
    res.status(500).json({ message: "failed to Fetch Employees", error: err.message });
  }
};

const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee || !checkOrgOwnershipEmployee(req, employee)) {
      return res.status(404).json({ message: "Employee Not Found" });
    }
    res.json(employee);
  } catch (err) {
    console.error("getEmployeeById:", err);
    res.status(500).json({ message: "failed to Fetch Employee", error: err.message });
  }
};

const createEmployee = async (req, res) => {
  try {

    if (!req.body) {
      return res.status(400).json({ message: "Request body is missing" });
    }

    const { firstName, lastName, email, phone, password } = req.body;

    if (!req.user || !req.user.organisationId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!firstName || !lastName || !email) {
      return res.status(400).json({ 
        message: "firstName, lastName & email required" 
      });
    }

    if (password.length < 6) {
          return res.status(400).json({
            message: "Password must be at least 6 characters"
          });
        }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      organisationId: req.user.organisationId,
      name: `${firstName} ${lastName}`,
      email,
      passwordHash: hashedPassword,
      isAdmin: false,
      mustChangePassword: true
    });

    const employee = await Employee.create({
      organisationId: req.user.organisationId,
      firstName,
      lastName,
      email,
      phone
    });

    await createLog({
      req,
      action: "EMPLOYEE_CREATED",
      event: "EMPLOYEE_CREATED",
      status: 201,
      userId: req.user.userId,
      organisationId: req.user.organisationId
    });

    res.status(201).json({
      employee,
    });
  } catch (err) {
    console.error("createEmployee:", err);
    res.status(500).json({ message: "Failed to Create Employee", error: err.message });
  }
};

const updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee || !checkOrgOwnershipEmployee(req, employee)) {
      return res.status(404).json({ message: "Employee Not Found" });
    }

    Object.assign(employee, req.body);
    await employee.save();

    await createLog({
      req,
      action: "EMPLOYEE_UPDATED",
      event: "EMPLOYEE_UPDATED",
      status: 200,
      userId: req.user.id,
      organisationId: req.user.organisationId,
      employeeId: employee._id
    });

    res.json(employee);
  } catch (err) {
    console.error("updateEmployee:", err);
    res.status(500).json({ message: "Failed to update Employee", error: err.message });
  }
};

const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee || !checkOrgOwnershipEmployee(req, employee)) {
      return res.status(404).json({ message: "Employee Not Found" });
    }

    await Employee.deleteOne({ _id: employee._id })

    await createLog({
      req,
      action: "EMPLOYEE_DELETED",
      event: "EMPLOYEE_DELETED",
      status: 200,
      userId: req.user.id,
      organisationId: req.user.organisationId,
      employeeId: employee._id
    });

    res.json({ message: "Employee Deleted Successfully" });
  } catch (err) {
    console.error("deleteEmployee:", err);
    res.status(500).json({ message: "Failed to Delete Employee", error: err.message });
  }
};

module.exports = {
    getAllEmployees,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee
}