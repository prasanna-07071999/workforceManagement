const dotenv = require("dotenv");
const path = require("path");

// Load env
if (true) {
  dotenv.config({ path: path.join(__dirname, ".env.development") });
  console.log("Loaded environment: .env.development");
} else {
  console.log("Running in production (Render env vars)");
}

const connectDB = require("./src/config/db");
const seedData = require("./src/seed");
const app = require("./src/app");

const PORT = process.env.PORT || 5000;

// Safety checks
if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI not set");
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error("❌ JWT_SECRET not set");
  process.exit(1);
}

const startServer = async () => {
  try {
    await connectDB();

    console.log("Running seed...");
    await seedData();

    app.listen(PORT, () => {
      console.log(` WorkPulse running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server Startup Failed:", error.message);
    process.exit(1);
  }
};
startServer();