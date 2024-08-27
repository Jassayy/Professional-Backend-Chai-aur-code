import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser"; //server se user ka browser ke cookies set and accept krna is its kaam

const app = express();

//first middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

//second middleware which tells us about the size of the data...so that server doesn not crash
//conifguring data from form
app.use(
  express.json({
    limit: "16kb",
  })
);

//confuguring data from url
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

//third and final configuration
app.use(express.static("public"));

app.use(cookieParser());

//routes import
import userRouter from "./routes/user.routes.js";

//routes declarations

app.use("/api/v1/users", userRouter);

//http://localhost:8000/api/v1/users/register

export { app };
