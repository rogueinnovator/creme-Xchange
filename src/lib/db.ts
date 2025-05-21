import mongoose from "mongoose";

export default async function connectDB() {
  try {
    if (mongoose.connection.readyState === 1) {
      return console.log("DB Already Connected");
    }

    const MONGO_URI = process.env.MONGO_URI;
    await mongoose.connect(MONGO_URI!);
  } catch (error) {
    console.log("Error Connecting DB : ", error);
    // process.exit(1);
  }
}
