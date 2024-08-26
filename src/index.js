// require("dotenv").config({ path: "./env" }); //As early as possible in your application, import and configure dotenv:
import dotenv from "dotenv"; //since require wala statement and import wala ek sath nahi use krna in code

import connectDB from "./db/index.js";
import { app } from "./app.js";

//note: databaseconnection in index.js
dotenv.config({ path: "./env" }); //As early as possible in your application, import and configure dotenv:
connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("MongoDB connection failed!", err);
  }); //import and call connectDB

// import express from "express";
// const app = express();

//1st approach
//we can also connect db like this or ifi function which goes like this:;(function)()
/*(async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);

    app.on("error", (err) => {
      console.log(err);
      throw err;
    });

    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.log("ERROR:", error);
    throw error;
  }
})();
*/
