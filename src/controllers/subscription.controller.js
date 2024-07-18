import mongoose from "mongoose"
import { User } from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const subscriberId = req.user._id;

    const channel = await User.findById(channelId);

    if (!channel) {
        throw new ApiError(400, "The channel does not exists!");
    }

    if (subscriberId.equals(channelId)) {
        throw new ApiError(400, "You can not subscribe to yourself");
    }

    const alreadySubscribed = await Subscription.findOne({
        subscriber: subscriberId,
        channel: channelId
    });

    if (alreadySubscribed) {
        const unsubscribed = await Subscription.deleteOne({
            subscriber: subscriberId,
            channel: channelId
        })

        if (unsubscribed) {
            return res
                .status(200)
                .json(new ApiResponse(200, {}, "Unsubscribed channel successfully."));
        }
    }

    const subscribe = await Subscription.create({
        subscriber: subscriberId,
        channel: channelId
    })

    return res
        .status(200)
        .json(new ApiResponse(200, subscribe, "Successfully subscribed to channel"));
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    const channel = await User.findById(channelId);

    if (!channel) {
        throw new ApiError(400, "Channel not found");
    }

    const subscribersList = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId) // Match the channel
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscribers"
            }
        },
        {
            $unwind: "$subscribers" // Unwind the subscribers array
        },
        {
            $project: { // Project only the required fields
                _id: "$subscribers._id",
                fullName: "$subscribers.fullName",
                username: "$subscribers.username",
                avatar: "$subscribers.avatar"
            }
        }
    ]);

    return res.status(200).json(new ApiResponse(200, subscribersList, "Subscribers fetched successfully"));
});


// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    const subscriber = await User.findById(channelId);

    if (!subscriber) {
        throw new ApiError(400, "User does not exists!")
    }

    const subscribedChannelsList = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channels"
            }
        },
        {
            $unwind: "$channels" // Unwind the subscribers array
        },
        {
            $project: { // Project only the required fields
                _id: "$channels._id",
                fullName: "$channels.fullName",
                username: "$channels.username",
                avatar: "$channels.avatar"
            }
        }
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, subscribedChannelsList, "Subscribed channels fetched sucessfully!"));
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}