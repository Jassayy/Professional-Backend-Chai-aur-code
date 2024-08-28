import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    console.log("Token from Cookies:", req.cookies?.accessToken); // Debugging line
    console.log("Token from Header:", req.header("Authorization"));

    if (!token || typeof token !== "string") {
      throw new ApiError(
        401,
        "Unauthorized request : Token is missing or invalid"
      );
    }

    console.log("Token: ", token);

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Access Token");
  }
});
