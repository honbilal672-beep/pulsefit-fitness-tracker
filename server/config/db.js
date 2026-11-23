import mongoose from "mongoose";
import { logger } from './logger.js';
let memoryServer = null;
const connectDB = async () => {
  const targetUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/fitness_tracker";
  try {
    logger.info(`Attempting MongoDB connection to: ${targetUri}`);
    await mongoose.connect(targetUri, {
      serverSelectionTimeoutMS: targetUri.startsWith("mongodb+srv://") ? 10000 : 3000
    });
    logger.info(`MongoDB connected successfully to host: ${mongoose.connection.host}`);
  } catch (primaryError) {
    logger.warn(`Could not connect to local MongoDB (${primaryError.message}). Starting in-memory MongoDB fallback...`);
    try {
      const { MongoMemoryServer } = await import("mongodb-memory-server");
      memoryServer = await MongoMemoryServer.create();
      const inMemoryUri = memoryServer.getUri();
      await mongoose.connect(inMemoryUri);
      logger.info(`Connected to In-Memory MongoDB Server at: ${inMemoryUri}`);
      logger.info("In-memory MongoDB is fully functional with persistence during process lifetime.");
    } catch (fallbackError) {
      logger.error(`Critical error starting database fallback: ${fallbackError.message}`);
      throw fallbackError;
    }
  }
  mongoose.connection.on("error", (err) => {
    logger.error(`MongoDB runtime connection error: ${err.message}`);
  });
  mongoose.connection.on("disconnected", () => {
    logger.warn("MongoDB disconnected");
  });
};
const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (memoryServer) {
      await memoryServer.stop();
    }
    logger.info("Database disconnected cleanly");
  } catch (err) {
    logger.error(`Error disconnecting database: ${err.message}`);
  }
};
export {
  connectDB,
  disconnectDB
};
