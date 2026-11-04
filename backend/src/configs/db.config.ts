import mongoose from "mongoose";

const connectDB = async (uri: string) => {
  try {
    await mongoose.connect(uri, {
      maxPoolSize: 50,
      maxIdleTimeMS: 60_000,
      heartbeatFrequencyMS: 10_000,
    });

    console.info("DB connected successfully.");
  } catch (error) {
    console.error(`ERROR CONNECTING TO DATABASE: ${error}`);
    process.exit(1);
  }
};

export default connectDB;
