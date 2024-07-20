import mongoose, { isValidObjectId } from "mongoose"
import { Playlist } from "../models/playlist.model.js"
import { Video } from "../models/video.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    const playlist = await Playlist.create({
        name: name,
        description: description
    })

    if (playlist) {
        return res
            .status(200)
            .json(new ApiResponse(200, playlist, "Playlist created successfully"));
    }
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params
    //TODO: get user playlists
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    //TODO: get playlist by id
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params

    const playlist = await Playlist.findById(playlistId);
    const video = await Video.findById(videoId);

    if (!playlist || !video) {
        throw new ApiError(400, "The video or playlist does not exist");
    }

    if (playlist.videos.includes(videoId)) {
        return res
            .status(200)
            .json(new ApiResponse(200, {}, "Video already added to playlist"));
    }

    playlist.videos.push(videoId);
    const videoAddedToPlaylist = await playlist.save();

    if (videoAddedToPlaylist) {
        return res
            .status(200)
            .json(new ApiResponse(200, videoAddedToPlaylist, "Video successfully added to playlist"));
    }
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    const playlist = await Playlist.findById(playlistId);
    const video = await Video.findById(videoId);

    if (!playlist || !video) {
        throw new Error("The video or playlist does not exist");
    }

    const index = playlist.videos.indexOf(videoId);
    if (index !== -1) {
        playlist.videos.splice(index, 1);
    }

    await playlist.save();

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Video removed from playlist"))
});

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(400, "Playlist does not exist");
    }

    const playlistDeleted = await playlist.deleteOne();

    if (playlistDeleted) {
        return res
            .status(200)
            .json(new ApiResponse(200, {}, "Playlist deleted successfully"));
    }
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body
    //TODO: update playlist
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}