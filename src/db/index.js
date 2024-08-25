import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

//2nd approach to connect db
const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    console.log(
      `\n MongoDB connnected!! DB HOST: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("ERROR IN CONNECTING DB", error);
    process.exit(1); //exit code here
  }
};

export default connectDB;
