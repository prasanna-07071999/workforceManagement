const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // ✅ STANDARDIZED USER OBJECT
    req.user = {
      userId: user._id.toString(),          // 🔥 FIX
      name: user.name,
      email: user.email,
      organisationId: user.organisationId.toString(),
      isAdmin: Boolean(user.isAdmin),
      mustChangePassword: user.mustChangePassword
    };

    req.organisationId = req.user.organisationId;

    next();
  } catch (err) {
    console.error("authMiddleware:", err.message);
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authMiddleware;