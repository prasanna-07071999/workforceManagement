const express = require("express");
const cors = require("cors");

const authMiddleware = require('./middleware/authMiddleware')
const logMiddleware = require('./middleware/logMiddleware')

const authRoutes = require('./routes/authRoute')
const employeeRoutes = require("./routes/employeeRoute");
const teamRoutes = require("./routes/teamRoute");
const statsRoutes = require("./routes/statsRoute");
const logRoutes = require("./routes/logRoute");
const attendanceRoutes = require("./routes/attendanceRoute");
const leaveRoutes = require("./routes/leaveRoute");
const holidayRoutes = require("./routes/holidayRoute");
const userRoutes = require("./routes/userRoute");
const dailyUpdateRoutes = require("./routes/dailyUpdateRoute");
const projectRoutes = require("./routes/projectRoute");
const recruitmentRoutes = require("./routes/recruitmentRoute");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const clientOrigin =
  process.env.NODE_ENV === "production"
    ? (process.env.CLIENT_ORIGIN_PROD || "https://workforcemanagement-frontend.onrender.com")
    : (process.env.CLIENT_ORIGIN_DEV || "http://localhost:3000");

app.use(
  cors({
    origin: clientOrigin,
    credentials: true
  })
);


app.use("/api/auth", authRoutes)


app.use(authMiddleware);
app.use(logMiddleware);

app.use("/api/employees", employeeRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/logs", logRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/holidays", holidayRoutes);
app.use("/api/users", userRoutes);
app.use("/api/daily-updates", dailyUpdateRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/recruitment", recruitmentRoutes);


app.get("/", (req, res) => {
  res.send("WorkPulse API is running");
});

// Global error handler
const errorHandler = (err, req, res, next) => {
  console.error("ERROR:", err.message);
  res.status(err.statusCode || 500).json({
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.stack : undefined
  });
};
app.use(errorHandler);


module.exports = app;
