import mongoose from "mongoose";

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return true;

  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.warn("⚠️ MONGO_URI is not set in environment variables.");
      return false;
    }

    console.log("Connecting to MongoDB...");
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 4000, // Quick timeout to avoid freezing if offline
    });

    isConnected = !!conn.connections[0].readyState;
    console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn("⚠️ MongoDB connection failed:", error.message);
    console.warn("ℹ️ Running in resilient fallback mode (in-memory demo data active). Live changes will still work!");
    return false;
  }
};

export const getDBStatus = () => isConnected;

export default connectDB;
