const mongoose = require("mongoose");

let _connected = false;

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn("[db] ⚠️  No MONGODB_URI — using in-memory store (accounts lost on restart)");
    return false;
  }
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
    _connected = true;
    console.log("[db] ✅ MongoDB connected");
    return true;
  } catch (err) {
    console.error("[db] ❌ MongoDB failed:", err.message);
    return false;
  }
}

const isConnected = () => _connected;
module.exports = { connectDB, isConnected };
