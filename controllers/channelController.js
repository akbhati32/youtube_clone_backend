import Channel from "../models/Channel.js";
import Video from "../models/Video.js";
import User from "../models/User.js";
import Comment from "../models/Comment.js";
import {
  uploadChannelBannerToCloudinary,
  cloudinary,
} from "../config/cloudinary.js";
import { nanoid } from "nanoid";

// ============================
// Create a new channel
// ============================
export const createChannel = async (req, res) => {
  try {
    const { channelName, description } = req.body;

    // Ensure required fields
    if (!channelName || !description) {
      return res.status(400).json({ message: "Both channelName and description are required." });
    }

    // Prevent user from creating multiple channels
    const existingChannel = await Channel.findOne({ owner: req.user._id });
    if (existingChannel) {
      return res.status(400).json({ message: "You already have a channel." });
    }

    let channelBanner = null;
    let bannerPublicId = null;

    // Upload banner if provided
    if (req.file) {
      try {
        const result = await uploadChannelBannerToCloudinary(req.file.buffer);
        channelBanner = result.secure_url;
        bannerPublicId = result.public_id;
      } catch (uploadErr) {
        return res.status(500).json({ message: "Failed to upload banner image" });
      }
    }

    // Create new channel document
    const newChannel = new Channel({
      channelId: nanoid(12), // unique ID for channel
      channelName,
      description,
      channelBanner,
      bannerPublicId,
      owner: req.user._id,
    });

    const savedChannel = await newChannel.save();

    // Link channel to user
    await User.findByIdAndUpdate(req.user._id, { $push: { channels: savedChannel._id } });

    return res.status(201).json(savedChannel);
  } catch (err) {
    res.status(500).json({ message: "Failed to create channel", error: err.message });
  }
};

// ============================
// Get channel + its videos
// ============================
export const getChannel = async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id);
    if (!channel) return res.status(404).json({ message: "Channel not found" });

    const videos = await Video.find({ channel: channel._id }); // fetch videos of this channel
    res.json({ channel, videos });
  } catch (err) {
    res.status(500).json({ error: "Error fetching channel" });
  }
};

// ============================
// Update channel details
// ============================
export const updateChannel = async (req, res) => {
  try {
    const channelId = req.params.id;
    const userId = req.user._id;

    const channel = await Channel.findById(channelId);
    if (!channel) return res.status(404).json({ message: "Channel not found" });

    // Ensure only owner can update
    if (channel.owner.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You are not authorized to update this channel" });
    }

    const { channelName, description } = req.body;

    // If a new banner is uploaded
    if (req.file) {
      // Remove old banner from Cloudinary
      if (channel.bannerPublicId) {
        await cloudinary.uploader.destroy(channel.bannerPublicId);
      }

      // Upload new banner
      const result = await uploadChannelBannerToCloudinary(req.file.buffer);
      channel.channelBanner = result.secure_url;
      channel.bannerPublicId = result.public_id;
    }

    // Update fields if provided
    if (channelName) channel.channelName = channelName;
    if (description) channel.description = description;

    await channel.save();
    res.status(200).json(channel);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

// ============================
// Delete channel, its videos & comments
// ============================
export const deleteChannel = async (req, res) => {
  try {
    const channelId = req.params.id;
    const userId = req.user._id;

    const channel = await Channel.findById(channelId);
    if (!channel) return res.status(404).json({ message: "Channel not found" });

    // Only owner can delete
    if (!channel.owner.equals(userId)) {
      return res.status(403).json({ message: "Unauthorized to delete the channel" });
    }

    // Delete all comments for this channel’s videos
    const videos = await Video.find({ channel: channel._id });
    const videoIds = videos.map((video) => video._id);
    await Comment.deleteMany({ video: { $in: videoIds } });

    // Delete Cloudinary media for each video
    for (const video of videos) {
      try {
        if (video.videoPublicId) {
          await cloudinary.uploader.destroy(video.videoPublicId, { resource_type: "video" });
        }
        if (video.thumbnailPublicId) {
          await cloudinary.uploader.destroy(video.thumbnailPublicId);
        }
      } catch (err) {
        console.error("Cloudinary deletion error for video:", err.message);
      }
    }

    // Remove videos from DB
    await Video.deleteMany({ channel: channel._id });

    // Delete banner from Cloudinary if exists
    if (channel.bannerPublicId) {
      try {
        await cloudinary.uploader.destroy(channel.bannerPublicId);
      } catch (err) {
        console.error("Failed to delete channel banner:", err.message);
      }
    }

    // Delete channel document
    await channel.deleteOne();

    // Remove channel reference from user
    await User.findByIdAndUpdate(userId, { $pull: { channel: channel._id } });

    res.status(200).json({ message: "Channel, its videos, banner, and comments deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to delete the channel" });
  }
};

// ============================
// Subscribe / Unsubscribe toggle
// ============================
export const toggleSubscription = async (req, res) => {
  try {
    const userId = req.user._id;
    const channelId = req.params.id;

    const channel = await Channel.findById(channelId);
    if (!channel) return res.status(404).json({ message: "Channel not found" });

    const alreadySubscribed = channel.subscriberList.includes(userId);

    if (alreadySubscribed) {
      channel.subscriberList.pull(userId); // unsubscribe
    } else {
      channel.subscriberList.push(userId); // subscribe
    }

    // Update subscriber count
    channel.subscribes = channel.subscriberList.length;
    await channel.save();
    await channel.populate("owner", "username");

    // Sync subscription list in User model
    const user = await User.findById(userId);
    if (alreadySubscribed) {
      user.subscriptions.pull(channelId);
    } else {
      user.subscriptions.push(channelId);
    }
    await user.save();

    res.status(200).json(channel);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};
