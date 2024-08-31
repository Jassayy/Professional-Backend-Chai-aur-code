import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  try {
    const { channelId } = req.params;

    if (!isValidObjectId(channelId)) {
      throw new ApiError(400, "Invalid ChannelId");
    }
    if (!req.user?._id) {
      throw new ApiError(401, "User not authenticated");
    }

    const subscriptionCheck = await Subscription.findOne({
      channel: channelId,
      subscriber: req.user?._id,
    });

    if (subscriptionCheck) {
      await Subscription.deleteOne({
        _id: subscriptionCheck._id,
      });
      return res
        .status(200)
        .json(
          new ApiResponse(200, {}, "Channel subscription removed successfully")
        );
    }

    const createSubscription = await Subscription.create({
      channel: channelId,
      subscriber: req.user?._id,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          createSubscription,
          "Channel subscription added successfully"
        )
      );
  } catch (error) {
    throw new ApiError(500, "An error occurred: " + error.message);
  }
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  try {
    const { channelId } = req.params;

    if (!isValidObjectId(channelId)) {
      throw new ApiError(404, "Invalid channel ID");
    }

    const subscribers = await Subscription.find({
      channel: channelId,
    }).populate("subscriber", "fullName email avatar coverImage username");

    if (!subscribers.length) {
      throw new ApiError(400, "No subscribers found");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, subscribers, "Subscribers fetched successfully")
      );
  } catch (error) {
    throw new ApiError(500, "Error fetching subscribers: " + error.message);
  }
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  try {
    const { subscriberId } = req.params;

    if (!isValidObjectId(subscriberId)) {
      throw new ApiError(400, "Subscriber not found");
    }

    const subscriptions = await Subscription.find({
      subscriber: subscriberId,
    }).populate("channel", "fullName email avatar coverImage username");

    if (!subscriptions.length) {
      throw new ApiError(404, "Subscriptions not found");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          subscriptions,
          "Subscribed channels fetched successfully"
        )
      );
  } catch (error) {
    throw new ApiError(500, "Error fetching channels :" + error.message);
  }
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
