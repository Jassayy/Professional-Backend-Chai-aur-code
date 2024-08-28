import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { ApiError } from "../utils/apiError.js";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String, //cloudinary URL
      required: true,
    },
    coverImage: {
      type: String,
    },
    watchHistory: [{ type: Schema.Types.ObjectId, ref: "Video" }],
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

//methods for middlewares//
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    return next("Error hashing password", error);
  }
});

userSchema.methods.isPasswordCorrect = async function (password) {
  // console.log("Entered password:", password);
  // console.log("Hashed password from DB:", this.password);

  if (!password || !this.password) {
    throw new ApiError("Both password and hash are required");
  }

  const match = await bcrypt.compare(password, this.password);

  // console.log("Password comparison match :", match);
  return match;
};

//TOKEN WILL GET GENERATED LIKE THIS
userSchema.methods.generateAccessToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

//GENERATES REFRESH TOKEN BUT IT NEEDS LESS THINGS AS IT GET REFRESHED AGAIN AND AGAIN
userSchema.methods.generateRefreshToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);
