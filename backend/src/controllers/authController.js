const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const Organisation = require('../models/Organisation')
const User = require('../models/User')
const createLog = require('../utils/createLog')

const JWT_SECRET = process.env.JWT_SECRET


const register = async (req, res) => {
  try {
    const { orgName, adminName, email, password } = req.body;
    if (!orgName || !adminName || !email || !password) {
      return res.status(400).json({ message: "orgName, adminName, email and password required" });
    }

    // create organisation
    const org = await Organisation.create({ name: orgName });

    // hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // create user
    const user = await User.create({
      organisationId: org._id,
      email,
      passwordHash,
      name: adminName,
      isAdmin: true
    });

    const token = jwt.sign(
        {
            userId: user._id.toString(),
            name: user.name,
            email: user.email,
            organisationId: org._id.toString(),
            organisationName: org.name,
            isAdmin: true
        },
        JWT_SECRET,
        { expiresIn: "8h" }
    );


    await createLog({
      req,
      action: "USER_REGISTER",
      event: "USER_REGISTER",
      status: 201,
      organisationId: org._id,
      userId: user._id
    });

    res.status(201).json({ token, isAdmin: true });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Registration Failed", error: err.message });
  }
};


const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "email and password required" });
    console.log("Login attempt:", email);
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User Not Found" });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(401).json({ message: "Invalid Password" });

    if (user.status !== "Active") {
      return res.status(403).json({
      message: `Account is ${user.status}. Contact administrator.`
      });
    }

    const organisation = await Organisation.findById(user.organisationId);

    const token = jwt.sign(
        {
            userId: user._id.toString(),
            name: user.name,
            email: user.email,
            organisationId: organisation ? organisation._id.toString() : null,
            organisationName: organisation ? organisation.name : "",
            isAdmin: user.isAdmin,
            mustChangePassword: user.mustChangePassword
        },
        JWT_SECRET,
        { expiresIn: "8h" }
    );
     if (user.mustChangePassword) {
      await createLog({
        req,
        action: "EMPLOYEE_FIRST_LOGIN",
        event: "EMPLOYEE_FIRST_LOGIN",
        status: 200,
        userId: user._id,
        organisationId: user.organisationId
      });
    } else {
      await createLog({
        req,
        action: "USER_LOGIN",
        event: "USER_LOGIN",
        status: 200,
        userId: user._id,
        organisationId: user.organisationId
      });
    }

    res.json({
      token,
      mustChangePassword: user.mustChangePassword,
      role: user.isAdmin ? "admin" : "employee"
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Login Failed", error: err.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters"
      });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.mustChangePassword = false;
    await user.save();

    await createLog({
      req,
      action: "PASSWORD_CHANGED",
      event: "PASSWORD_CHANGED",
      status: 200,
      userId: user._id,
      organisationId: user.organisationId
    });

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("changePassword:", err);
    res.status(500).json({
      message: "Failed to change password",
      error: err.message
    });
  }
};


module.exports = {register, login, changePassword}