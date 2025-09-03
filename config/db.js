import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();    // Load environment variables from .env file

// Function to connect to MongoDB
const connectDB = async () => {
  try {
    // Connect using MONGO_URI from .env
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);  // Exit process if connection fails
  }
};

export default connectDB;