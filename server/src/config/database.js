// config/db.js
const mongoose = require('mongoose');
// import mongoose from "mongoose";

// Load environment variables from .env file (optional)
// require('dotenv').config();

// MongoDB connection string from environment variable
const mongoURI = 'mongodb://localhost:27017/music_player';

// Function to connect to MongoDB
module.exports = connectDB = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log('MongoDB Connected');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err.message);
    process.exit(1); // Exit process with failure
  }
};

// export connectDB;
