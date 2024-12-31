const mongoose = require("mongoose");
require("dotenv").config();

const db = process.env.MONGO_URL;

const connectToDB = async () => {
    try {
        await mongoose.connect(db);
        console.log("Connected to MongoDB 🚀");
    } catch (error) {
        console.error("Error connecting to MongoDB", error);
    }
}

module.exports = connectToDB;