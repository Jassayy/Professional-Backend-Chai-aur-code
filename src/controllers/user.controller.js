import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken; //refresh token in user db
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating access and refresh token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  //step 1 : get user details from frontend
  //step 2 : validation whether data is correct or no - check not empty
  //step 3 : check if user already exists : username and email
  //step 4 : check for images and avatar
  //step 5 : upload them to cloudinary , avatar
  //step 6 : create user object - create entry in db
  //step 7 : remove password and refresh token field from response
  //step 8 : check for user creation
  //step 9 : return response

  const { fullName, email, username, password } = req.body; //step 1
  // console.log("email:", email);

  // console.log("\ndata: \n", req.body);

  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  } //step 2

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(
      409,
      "User already exists with the same username or email"
    );
  } //step 3
  // console.log(req.files);
  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0].path;

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Please provide an avatar");
  } //step 4

  const avatar = await uploadOnCloudinary(avatarLocalPath); //step 5
  const coverImage = await uploadOnCloudinary(coverImageLocalPath); //step 5

  if (!avatar) {
    throw new ApiError(400, "Please provide an avatar");
  }

  const user = await User.create({
    fullName,
    email,
    username: username.toLowerCase(),
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  }); //step 6

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken "
  );
  if (!createdUser) {
    throw new ApiError(500, "User creation failed");
  } //step 7

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully")); //step8
});

const loginUser = asyncHandler(async (req, res) => {
  //todo: take data from user
  //check validation
  //username or email basis
  //check user is there in db or no (find user)
  //if (user) then password check
  //password okay? then access and refresh token
  //send cookies
  //successfull login

  const { username, email, password } = req.body;

  console.log("request body : ", req.body);

  console.log("Password from request : ", password);

  if (!username && !email) {
    //username and people case for login
    throw new ApiError(400, "Username and Email are required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid Credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  //send cookies

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken ", options)
    .clearCookie("refreshToken ", options)
    .json(new ApiResponse(200, {}, "User LoggedOut successfully"));
});

export { registerUser, loginUser, logoutUser };
