import { Tweet } from "../models/tweet.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;

    const user = await User.findById(req.user?._id);

    if (!user) {
        throw new ApiError(400, "User does not exist");
    }

    const tweet = await Tweet.create({
        content: content,
        owner: user._id
    })

    const populateTweet = await Tweet.findById(tweet._id).populate("owner", "username avatar");

    return res
        .status(200)
        .json(new ApiResponse(200, populateTweet, "Tweet created sucessfully"));
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}