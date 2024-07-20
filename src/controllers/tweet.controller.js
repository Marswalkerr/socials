import { Tweet } from "../models/tweet.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { updateComment } from "./comment.controller.js"

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
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(400, "User does not exist");
    }

    const tweetsList = await Tweet.find({
        owner: user._id
    }).populate("owner", "username avatar");

    return res
        .status(200)
        .json(new ApiResponse(200, tweetsList, "Tweets fetched successfully"));
})

const updateTweet = asyncHandler(async (req, res) => {
    const { updatedContent } = req.body;
    const { tweetId } = req.params;

    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new ApiError(400, "Tweer does not exist");
    }

    if (!tweet.owner.equals(req.user._id)) {
        throw new ApiError(401, "UNAUTHORIZED! You don't have permission to edit this tweet!");
    }

    tweet.content = updatedContent;
    await tweet.save();

    return res
        .status(200)
        .json(new ApiResponse(200, tweet, "Tweet updated successfully"));
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