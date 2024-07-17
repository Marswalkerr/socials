import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit, query, sortBy, sortType } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let filter = {};
    let sort = { createdAt: -1 }; // Default sort

    if (query) {
        filter = {
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ]
        };
    }

    if (sortBy) {
        sort = { [sortBy]: sortType === 'desc' ? -1 : 1 };
    }

    try {
        const videos = await Video.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit))
            .select('title description createdAt views owner');

        const totalCount = await Video.countDocuments(filter);

        return res.status(200).json(new ApiResponse(
            200,
            {
                videos,
                paginationInfo: {
                    currentPage: parseInt(page),
                    limit: parseInt(limit),
                    totalVideos: totalCount,
                    hasNextPage: videos.length === parseInt(limit)
                }
            },
            "Videos fetched successfully"
        ));
    } catch (error) {
        console.error("Error in getAllVideos:", error);
        return res.status(500).json(new ApiResponse(
            500,
            null,
            "An error occurred while fetching videos"
        ));
    }
});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    // TODO: get video, upload to cloudinary, create video

    const videoLocalPath = req.files?.videoFile?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

    if (!videoLocalPath) {
        throw new ApiError(400, "Video file upload failed");
    }

    const videoFile = await uploadOnCloudinary(videoLocalPath);
    const thumbnailFile = await uploadOnCloudinary(thumbnailLocalPath);

    if (!(videoFile || thumbnailFile)) {
        throw new ApiError(400, "Video upload on cloudinary failed");
    }

    const video = await Video.create({
        title,
        description,
        videoFile: videoFile.url,
        thumbnail: thumbnailFile.url,
        duration: videoFile.duration,
        owner: req.user?._id
    })

    if (!video) {
        throw new ApiError(500, "Something went wrong while uploading video to db");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video uploaded successfully"));
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id

    if (!videoId) {
        throw new ApiError(400, "Video does not exists");
    }
    const videoDetails = await Video.findById(videoId);

    if (!videoDetails) {
        throw new ApiError(500, "Something went wrong while finding video");
    }

    // Find user
    const user = await User.findById(req.user._id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Check if video is already in watch history
    if (!user.watchHistory.includes(videoId)) {
        videoDetails.views += 1;
        await videoDetails.save();
        user.watchHistory.push(videoId);
        await user.save();
    }

    return res
        .status(200)
        .json(new ApiResponse(200, videoDetails, "Video fetched successfully"));
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { title, description } = req.body;
    const thumbnailLocalPath = req.file?.path;

    if (!videoId) {
        throw new ApiError(400, "No such video found");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Check if the current user is the owner of the video
    if (!video.owner.equals(req.user._id)) {
        throw new ApiError(403, "Unauthorized: You can't update other's video");
    }

    // Update fields if provided
    if (title) video.title = title;
    if (description) video.description = description;

    // Handle thumbnail update
    if (thumbnailLocalPath) {
        const thumbnailCloudPath = await uploadOnCloudinary(thumbnailLocalPath);
        if (!thumbnailCloudPath) {
            throw new ApiError(500, "Thumbnail upload on cloudinary failed");
        }
        video.thumbnail = thumbnailCloudPath.url;
    }

    // Save the updated video
    await video.save();

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video updated successfully"));
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}