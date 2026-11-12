import mongoose from "mongoose";
import logger from "@utils/logger.util.js"

const connectDB = async (uri: string) => {
  try {
    await mongoose.connect(uri, {
      maxPoolSize: 50,
      maxIdleTimeMS: 60_000,
      heartbeatFrequencyMS: 10_000,
    });

    logger.info("DB connected successfully.");
  } catch (error) {
    logger.error(`ERROR CONNECTING TO DATABASE: ${error}`);
    process.exit(1);
  }
};

export default connectDB;
