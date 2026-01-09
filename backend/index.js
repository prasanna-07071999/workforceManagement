const dotenv = require("dotenv");
const path = require("path");

// Load env only for LOCAL
if (process.env.NODE_ENV !== "production") {
  const envFile = ".env.development";
  dotenv.config({ path: path.join(__dirname, envFile) });
  console.log(`Loaded environment: ${envFile}`);
} else {
  console.log("Running in production, using Render env vars");
}

const connectDB = require("./src/config/db");
const seedData = require("./src/seed");
const app = require("./src/app");

const PORT = process.env.PORT || 5000;

// ❗ DO NOT EXIT IN PRODUCTION
if (!process.env.MONGO_URI) {
  console.error("MongoURI not set");
  if (process.env.NODE_ENV !== "production") process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET not set");
  if (process.env.NODE_ENV !== "production") process.exit(1);
}

const startServer = async () => {
  try {
    await connectDB();

    // Seed only locally
    if (process.env.NODE_ENV !== "production") {
      await seedData();
      console.log("Seed data loaded (development only)");
    }

    app.listen(PORT, () => {
      console.log(`WorkPulse is running on ${PORT}`);
    });
  } catch (e) {
    console.log("Server Startup Failed", e.message);
    process.exit(1);
  }
};

startServer();
