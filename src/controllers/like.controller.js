import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"
import { Comment } from "../models/comment.model.js"

const toggleVideoLike = asyncHandler(async (req, res) => {

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    const user = await User.findById(req.user?._id);

    if (!user) {
        throw new ApiError(400, "User does not exist")
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new ApiError(400, "Comment does not exist");
    }

    const alreadyLiked = await Like.findOne({ comment: commentId, likedBy: req.user?._id });

    if (alreadyLiked) {
        const unlikeComment = await Like.deleteOne({
            comment: commentId,
            likedBy: req.user?._id
        })

        if (unlikeComment) {
            return res
                .status(200)
                .json(new ApiResponse(200, {}, "Comment unliked successfully"));
        }
    }

    const createCommentLike = await Like.create({
        comment: commentId,
        likedBy: user._id
    })

    return res
        .status(200)
        .json(new ApiResponse(200, createCommentLike, "Comment liked successfully"));
})

const toggleTweetLike = asyncHandler(async (req, res) => {

})

const getLikedVideos = asyncHandler(async (req, res) => {

})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}