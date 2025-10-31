import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => { 
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || "mongodb+srv://brodj73_db_user:0yWGRbQCdhub3R7r@interviewclustor.zwuxfrx.mongodb.net/");
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDB;
