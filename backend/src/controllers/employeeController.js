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
    const { firstName, lastName, email, phone, password } = req.body;

    if (!req.user || !req.user.organisationId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!firstName || !lastName || !email) {
      return res.status(400).json({
        message: "firstName, lastName & email required"
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters"
      });
    }

    const organisationId = req.user.organisationId;

    // ✅ 1. CHECK EMPLOYEE (NOT USER)
    const existingEmployee = await Employee.findOne({ email });

    if (existingEmployee) {
      return res.status(409).json({
        message: "Employee already exists"
      });
    }

    // ✅ 2. CHECK USER
    let user = await User.findOne({ email });

    if (!user) {
      const hashedPassword = await bcrypt.hash(password, 10);

      user = await User.create({
        organisationId,
        name: `${firstName} ${lastName}`,
        email,
        passwordHash: hashedPassword,
        isAdmin: false,
        mustChangePassword: true,
        status: "Active"
      });
    }

    // ✅ 3. CREATE EMPLOYEE (WITH userId)
    const employee = await Employee.create({
      organisationId,
      userId: user._id,   // 🔥 VERY IMPORTANT FIX
      firstName,
      lastName,
      email,
      phone
    });

    await createLog({
      req,
      action: "POST /api/employees",
      event: "EMPLOYEE_CREATED",
      status: 201
    });

    res.status(201).json(employee);

  } catch (err) {
    console.error("createEmployee:", err);
    res.status(500).json({
      message: "Failed to Create Employee",
      error: err.message
    });
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
      action: "PUT /api/employees/:id",
      event: "EMPLOYEE_UPDATED",
      status: 200,
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
      action: "DELETE /api/employees/:id",
      event: "EMPLOYEE_DELETED",
      status: 200,
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