const mongoose = require('mongoose')

const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URI)
        console.log('MongoDB connected')
        console.log("Connected to DB:", process.env.MONGO_URI);
    } catch(error) {
        console.log('Mongo Connection failed', error.message)
        process.exit(1)
    }
}

module.exports = connectDB