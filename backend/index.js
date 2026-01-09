const dotenv = require("dotenv");
const path = require("path");

const envFile = process.env.NODE_ENV === "production" 
  ? ".env.production"
  : ".env.development";

dotenv.config({ path: path.join(__dirname, envFile) });

console.log(`Loaded environment: ${envFile}`);

const connectDB = require('./src/config/db')
const seedData = require('./src/seed')
const app = require('./src/app')

const PORT = process.env.PORT || 5000;

if (!process.env.MONGO_URI){
  console.log("MongoURI not set")
  process.exit(1)
}

if (!process.env.JWT_SECRET){
  console.log("JWT_SECRET not set")
  process.exit(1)
}

const startServer = async () => {
  try{
    await connectDB()
    await seedData()
    app.listen(PORT, () => {
      console.log(`WorkPulse is running on ${PORT}`)
    })
  } catch(e){
    console.log("Server Startup Failed", e.message)
    process.exit(1)
  }
}

startServer()
