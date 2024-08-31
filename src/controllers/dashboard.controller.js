import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  const getChannelStats = asyncHandler(async (req, res) => {
    try {
      if (!req.user?._id) throw new ApiError(401, "Unauthorized request");
      const userId = req.user._id;

      const channelStats = await Video.aggregate([
        { $match: { owner: userId } },
        // Lookup for Subscribers of the channel
        {
          $lookup: {
            from: "subscriptions",
            localField: "owner",
            foreignField: "channel",
            as: "subscribers",
          },
        },
        // Lookup for the channels the user subscribes to
        {
          $lookup: {
            from: "subscriptions",
            localField: "owner",
            foreignField: "subscriber",
            as: "subscribedTo",
          },
        },
        // Lookup likes for the user's videos
        {
          $lookup: {
            from: "likes",
            localField: "_id",
            foreignField: "video",
            as: "likedVideos",
          },
        },
        // Lookup comments for the user's videos
        {
          $lookup: {
            from: "comments",
            localField: "_id",
            foreignField: "video",
            as: "videoComments",
          },
        },
        // Lookup tweets by the user
        {
          $lookup: {
            from: "tweets",
            localField: "owner",
            foreignField: "owner",
            as: "tweets",
          },
        },
        // Group to calculate stats
        {
          $group: {
            _id: null,
            totalVideos: { $sum: 1 },
            totalViews: { $sum: "$views" },
            subscribers: { $first: "$subscribers" },
            subscribedTo: { $first: "$subscribedTo" },
            totalLikes: { $sum: { $size: "$likedVideos" } },
            totalComments: { $sum: { $size: "$videoComments" } },
            totalTweets: { $sum: { $size: "$tweets" } },
          },
        },
        // Projecting the desired fields
        {
          $project: {
            _id: 0,
            totalVideos: 1,
            totalViews: 1,
            subscribers: { $size: "$subscribers" },
            subscribedTo: { $size: "$subscribedTo" },
            totalLikes: 1,
            totalComments: 1,
            totalTweets: 1,
          },
        },
      ]);

      // Checking if stats are found
      if (channelStats.length === 0) {
        throw new ApiError(404, "No channel stats found");
      }

      res
        .status(200)
        .json(
          new ApiResponse(
            200,
            channelStats[0],
            "Channel stats fetched successfully"
          )
        );
    } catch (error) {
      throw new ApiError(
        500,
        "An error occurred while fetching channel stats: " + error.message
      );
    }
  });
});

const getChannelVideos = asyncHandler(async (req, res) => {
  if (!req.user?._id) {
    throw new ApiError(401, "User not authenticated");
  }

  const videos = await Video.find({ owner: req.user?.id });

  if (!videos.length) {
    throw new ApiError(400, "No videos found for this channel");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Videos fetched successfully"));
});

export { getChannelStats, getChannelVideos };
