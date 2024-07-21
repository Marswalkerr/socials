import mongoose from "mongoose"
import { Video } from "../models/video.model.js"
import { Subscription } from "../models/subscription.model.js"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const userId = req.user._id;

    const totalSubscribers = await Subscription.countDocuments({ channel: userId });

    const totalVideos = await Video.countDocuments({ owner: userId });

    const videos = await Video.find({ owner: userId });
    const totalViews = videos.reduce((acc, video) => acc + video.views, 0);

    const totalLikes = await Like.countDocuments({
        video: { $in: videos.map(video => video._id) }
    });

    const channelStats = {
        totalSubscribers,
        totalVideos,
        totalViews,
        totalLikes
    };

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            channelStats,
            "Channel stats retrieved successfully"
        ));
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
})

export {
    getChannelStats,
    getChannelVideos
}