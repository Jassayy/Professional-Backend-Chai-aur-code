import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
  try {
    const { content } = req.body;

    if (!content || content.length === 0) {
      throw new ApiError(400, "Content is required for posting a tweet");
    }

    const tweet = await Tweet.create({
      content: content,
      owner: req.user?._id,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, tweet, "Tweet created successfully"));
  } catch (error) {
    throw new ApiError(500, "Error creating tweet");
  }
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
  try {
    const { userId } = req.params;
    if (!userId) {
      throw new ApiError(400, "User not found");
    }

    const tweets = await Tweet.find({
      owner: userId,
    });

    if (!tweets.length) {
      throw new ApiError(400, "Tweets not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, tweets, "Tweets fetched successfully"));
  } catch (error) {
    throw new ApiError(500, "Error fetching tweets : " + error.message);
  }
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
  try {
    const { content } = req.body;
    const { tweetId } = req.params;

    if (!content || content.length === 0) {
      throw new ApiError(400, "Content is required to post a tweet");
    }
    if (!isValidObjectId(tweetId)) {
      throw new ApiError(400, "Invalid tweet id");
    }
    const tweet = await Tweet.findByIdAndUpdate(
      tweetId,
      {
        $set: {
          content: content,
        },
      },
      {
        new: true,
      }
    );

    return res
      .status(200)
      .json(new ApiResponse(200, tweet, "Tweet updated successfully"));
  } catch (error) {
    throw new ApiError(500, "Error updating tweet : " + error.message);
  }
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
  try {
    const { tweetId } = req.params;

    if (!isValidObjectId(tweetId)) {
      throw new ApiError(400, "Invalid tweet id");
    }
    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
      throw new ApiError(404, "Tweet not found");
    }

    await Tweet.remove();

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Tweet deleted successfully"));
  } catch (error) {
    throw new ApiError(
      500,
      "An error occurred while deleting the tweet : " + error.message
    );
  }
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
