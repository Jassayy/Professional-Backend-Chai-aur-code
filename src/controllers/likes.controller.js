import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  try {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
      throw new ApiError(400, "Invalid video ID");
    }

    if (!req.user || !req.user._id) {
      throw new ApiError(401, "User not authenticated");
    }

    const like = await Like.findOne({ video: videoId, likedBy: req.user._id });

    if (like) {
      await Like.deleteOne({ _id: like._id });

      return res
        .status(200)
        .json(new ApiResponse(200, {}, "Liked removed successfully"));
    }

    const createLike = await Like.create({
      video: videoId,
      likedBy: req.user?._id,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, createLike, "Video liked successfully"));
  } catch (error) {
    throw new ApiError(500, "An error occurred : " + error?.message);
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  try {
    const { commentId } = req.params;

    if (!isValidObjectId(commentId)) {
      throw new ApiError(400, "Invalid comment ID");
    }

    if (!req.user || !req.user._id) {
      throw new ApiError(401, "User not authenticated");
    }

    const commentLike = await Like.findOne({
      commment: commentId,
      likedBy: req.user._id,
    });

    if (commentLike) {
      await Like.deleteOne({ _id: commentLike._id });
      return res
        .status(200)
        .json(new ApiResponse(200, {}, "Comment like deleted"));
    }

    const createCommentLike = await Like.create({
      comment: commentId,
      likedBy: req.user._id,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(200, createCommentLike, "Comment liked successfully")
      );
  } catch (error) {
    throw new ApiError(500, "An error occurred: " + error?.message);
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  try {
    const { tweetId } = req.params;

    if (!isValidObjectId(tweetId)) {
      throw new ApiError(400, "Invalid tweet ID");
    }

    if (!req.user || !req.user._id) {
      throw new ApiError(401, "User not authenticated");
    }

    const tweetLike = await Like.findOne({
      tweet: tweetId,
      likedBy: req.user._id,
    });

    if (tweetLike) {
      await Like.deleteOne({ _id: tweetLike._id });

      return res
        .status(200)
        .json(new ApiResponse(200, {}, "Tweet like removed successfully"));
    }

    const createTweetLike = await Like.create({
      tweet: tweetId,
      likedBy: req.user._id,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, createTweetLike, "Tweet liked successfully"));
  } catch (error) {
    throw new ApiError(500, "An error occurred: " + error?.message);
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
      throw new ApiError(400, "Invalid user ID");
    }

    //finding likes of user
    const likes = await Like.find({
      likedBy: userId,
      video: { $exists: true },
    }).populate("video");

    const likedVideos = likes.map((like) => like.video);

    return res
      .status(200)
      .json(
        new ApiResponse(200, likedVideos, "Liked videos fetched successfully")
      );
  } catch (error) {
    throw new ApiError(
      500,
      "An error occurred while fetching videos: " + error.message
    );
  }
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
