import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      throw new ApiError(400, "Please provide a name and description");
    }

    const playlist = await Playlist.create({
      name: name,
      description: description,
      owner: req.user?._id,
      videos: [],
    });

    return res
      .status(200)
      .json(new ApiResponse(200, playlist, "Playlist created successfully"));
  } catch (error) {
    throw new ApiError(500, "Error creating playlist: " + error.message);
  }
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
      throw new ApiError(400, "Invalid userId");
    }

    const playlists = await Playlist.find({ owner: userId });

    if (!playlists.length) {
      throw new ApiError(404, "No playlists found");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, playlists, "User playlists fetched successfully")
      );
  } catch (error) {
    throw new ApiError(500, "Error fetching user playlists: " + error?.message);
  }
});

const getPlaylistById = asyncHandler(async (req, res) => {
  try {
    const { playlistId } = req.params;

    if (!isValidObjectId(playlistId)) {
      throw new ApiError(400, "Invalid playlist ID");
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
      throw new ApiError(404, "Playlist not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, playlist, "Playlist fetched successfully"));
  } catch (error) {
    throw new ApiError(500, "Error fetching playlist: " + error?.message);
  }
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  try {
    const { playlistId, videoId } = req.params;

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
      throw new ApiError(400, "Invalid playlistId or videoId");
    }

    const playlist = await Playlist.findByIdAndUpdate(
      playlistId,
      {
        $push: { videos: videoId },
      },
      {
        new: true,
      }
    );

    if (!playlist) {
      throw new ApiError(404, "Playlist not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, playlist, "Video added successfully"));
  } catch (error) {
    throw new ApiError(
      500,
      "Error adding video to playlist: " + error?.message
    );
  }
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  try {
    const { playlistId, videoId } = req.params;

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
      throw new ApiError(400, "Invalid playlistId or videoId");
    }

    const playlist = await Playlist.findByIdAndUpdate(
      playlistId,
      {
        $pull: { videos: videoId },
      },
      {
        new: true,
      }
    );

    if (!playlist) {
      throw new ApiError(404, "Playlist not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, playlist, "Video removed successfully"));
  } catch (error) {
    throw new ApiError(
      500,
      "Error removing video from playlist: " + error?.message
    );
  }
});

const deletePlaylist = asyncHandler(async (req, res) => {
  try {
    const { playlistId } = req.params;

    if (!isValidObjectId(playlistId)) {
      throw new ApiError(400, "Invalid playlist ID");
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
      throw new ApiError(404, "Playlist not found");
    }

    await Playlist.deleteOne({ _id: playlistId });

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Playlist deleted successfully"));
  } catch (error) {
    throw new ApiError(500, "Error deleting playlist :" + error.message);
  }

  // TODO: delete playlist
});

const updatePlaylist = asyncHandler(async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { name, description } = req.body;

    if (!isValidObjectId(playlistId)) {
      throw new ApiError(400, "Invalid playlist Id");
    }

    if (!name || !description) {
      throw new ApiError(400, "Please provide a name and description");
    }

    const playlist = await Playlist.findByIdAndUpdate(
      playlistId,
      { name, description },
      { new: true }
    );

    if (!playlist) {
      throw new ApiError(404, "Playlist not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, playlist, "Playlist updated successfully"));
  } catch (error) {
    throw new ApiError(500, "Error updating playlist : " + error?.message);
  }
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
