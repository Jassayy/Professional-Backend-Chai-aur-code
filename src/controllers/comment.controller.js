import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  try {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!isValidObjectId(videoId)) {
      throw new ApiError(400, "Invalid video ID");
    }

    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);

    if (isNaN(pageNumber) || pageNumber < 1) {
      throw new ApiError(400, "Invalid page number");
    }

    if (isNaN(pageSize) || pageSize < 1) {
      throw new ApiError(400, "Invalid limit value");
    }

    // Calculate skip value
    const skip = (pageNumber - 1) * pageSize;

    const comments = await Comment.find({ video: videoId })
      .skip(skip)
      .limit(pageSize);

    if (comments.length === 0) {
      return res
        .status(404)
        .json(new ApiResponse(404, {}, "No comments found for this video"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, comments, "Fetch All Comments Successfully"));
  } catch (error) {
    throw new ApiError(500, "Error fetching comments: " + error.message);
  }
});

const addComment = asyncHandler(async (req, res) => {
  try {
    const { videoId } = req.params;
    const { content } = req.body;

    if (!isValidObjectId(videoId)) {
      throw new ApiError(400, "Invalid video ID");
    }

    if (!content) {
      throw new ApiError(400, "Please provide content for the comment");
    }

    if (!req.user || !req.user._id) {
      throw new ApiError(401, "User not authenticated");
    }

    const comment = await Comment.create({
      video: videoId,
      owner: req.user?._id,
      content: content,
    });

    if (!comment) {
      throw new ApiError(400, "Error creating comment");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, comment, "Comment added successfully"));
  } catch (error) {
    throw new ApiError(500, "Error creating comment" + error.message);
  }
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  try {
    const { commentId } = req.params;
    const { content } = req.body;

    if (!isValidObjectId(commentId)) {
      throw new ApiError(400, "Invalid comment ID");
    }

    if (!content) {
      throw new ApiError(400, "Please provide a valid content");
    }

    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      { content: content },
      { new: true }
    );

    if (!updatedComment) {
      throw new ApiError(404, "Comment not found  ");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, updatedComment, "Comment updated successfully")
      );
  } catch (error) {
    throw new ApiError(500, "Error updating comment: " + error.message);
  }
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  try {
    const { commentId } = req.params;

    if (!isValidObjectId(commentId)) {
      throw new ApiError(400, "Invalid comment ID");
    }

    const deletedComment = await Comment.findByIdAndDelete(commentId);

    if (!deletedComment) {
      throw new ApiError(404, "Comment not deleted");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Comment deleted successfully"));
  } catch (error) {
    throw new ApiError(500, "Error deleting comment: " + error.message);
  }
});

export { getVideoComments, addComment, updateComment, deleteComment };
