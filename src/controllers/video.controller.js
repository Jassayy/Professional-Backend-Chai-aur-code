import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  //TODO: get all videos based on query, sort, pagination

  const {
    page = 1,
    limit = 10,
    query = "",
    sortBy = "createdAt",
    sortType = 1,
    userId,
  } = req.query;

  const pageNumber = parseInt(page, 10);
  const pageSize = parseInt(limit, 10);

  if (!pageNumber || pageumber < 1) {
    throw new ApiError(400, "Invalid page number");
  }
  if (!pageSize || pageSize < 1 || pageSize > 100) {
    throw new ApiError(400, "Invalid limit");
  }

  const matchCondition = {
    $match: {
      $or: [
        {
          title: { $regex: query, $options: "i" },
        },
        {
          description: { $regex: query, $options: "i" },
        },
      ],
    },
  };

  if (userId) {
    matchCondition.$match.owner = new mongoose.Types.ObjectId(userId); //matches videos based on user id
  }

  const pipeline = [
    matchCondition,
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              fullName: 1,
              username: 1,
              avatar: "$avatar.url",
            },
          },
        ],
      },
    },
    {
      $addFields: {
        owner: {
          $first: "owner",
        },
      },
    },
    {
      [sortBy]: sortType,
    },
  ];

  const options = {
    page: pageNumber,
    limit: pageSize,
    customLabels: {
      totalDocs: "totalVideos",
      docs: "videos",
    },
  };

  try {
    const result = await Video.aggregatePaginate(pipeline, options);

    if (result.videos.length === 0) {
      throw new ApiResponse(404, [], "Videos not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, result, "Videos fetched successfully"));
  } catch (error) {
    throw new ApiError(500, error?.message || "Error fetching videos");
  }
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // TODO: get video, upload to cloudinary, create video

  if (!title || !description) {
    throw new ApiError(400, "Title and Description are required");
  }

  const videoLocalPath = req.files?.videoFile[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

  if (!videoLocalPath || !thumbnailPath) {
    throw new ApiError(400, "Please provide video and thumbnail");
  }

  const video = await uploadOnCloudinary(videoLocalPath);
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  const publishedVideo = await Video.create({
    title,
    description,
    videoFile: {
      public_id: video.public_id,
      url: video.secure_url,
    },
    thumbnail: {
      public_id: thumbnail.public_id,
      url: thumbnail.secure_url,
    },
    duration: video.duration,
    owner: req.user._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, publishedVideo, "Video Published successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid Video ID");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(400, "Video not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video fecthed successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;
  //TODO: update video details like title, description, thumbnail

  const updateData = { title, description };

  const thumbnailLocalPath = req.files?.thumbnail[0].path;
  if (!thumbnailLocalPath) {
    throw new ApiError(400, "Please provide a thumbnail");
  }

  try {
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    updateData.thumbnail = {
      public_id: thumbnail.public_id,
      url: thumbnail.secure_url,
    };
  } catch (error) {
    throw new ApiError(500, "Error uploading on cloudinary");
  }

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid Video ID");
  }

  const video = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: updateData,
    },
    {
      new: true,
    }
  );
  if (!video) {
    throw new ApiError(400, "Video not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video details updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid Video ID");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }
  try {
    await destroyCloudImage(video.thumbnail.public_id);
    await deleteCloudVideo(video.videoFile.public_id);

    await Video.findByIdAndDelete(videoId);

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Video deleted successfully"));
  } catch (error) {
    throw new ApiError(500, "Error deleting video " + error.message);
  }
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid Video Id");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(400, "Video not found");
  }
  const updateVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        isPublished: !video.isPublished,
      },
    },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, updateVideo, "Publish status toggled successfully")
    );
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
