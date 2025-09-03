import asyncHandler from "express-async-handler";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

import Video from "../models/Video.js";
import Channel from "../models/Channel.js";
import Comment from "../models/Comment.js";

import {
  uploadVideoToCloudinary,
  uploadThumbnailToCloudinary,
} from "../config/cloudinary.js";

// ==========================================
// Helper: upload file buffer to Cloudinary
// ==========================================
const streamUpload = (fileBuffer, options) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (result) resolve(result);
      else reject(err);
    });
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

// ==========================================
// Get all videos (latest first)
// ==========================================
export const getAllVideos = asyncHandler(async (req, res) => {
  const videos = await Video.find({})
    .sort({ createdAt: -1 })
    .populate("uploader", "username")
    .populate("channel", "channelName channelBanner");
  res.json(videos);
});

// ==========================================
// Get single video by ID with uploader, channel, comments
// ==========================================
export const getVideoById = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id)
    .populate("uploader", "username")
    .populate("channel", "channelName channelBanner")
    .populate({
      path: "comments",
      populate: { path: "author", select: "username" },
      options: { sort: { createdAt: -1 } },
    });

  if (!video) return res.status(404).json({ message: "Video not found" });
  res.json({ video });
});

// ==========================================
// Get videos uploaded by logged-in user
// ==========================================
export const getVideosByLoggedInUser = asyncHandler(async (req, res) => {
  const videos = await Video.find({ uploader: req.user._id }).populate("channel");
  res.status(200).json(videos);
});

// ==========================================
// Upload new video + thumbnail
// ==========================================
export const uploadVideo = asyncHandler(async (req, res) => {
  const { title, description, category } = req.body;
  const userId = req.user._id;

  // Validate video + thumbnail
  if (!req.files?.video?.[0] || !req.files?.thumbnail?.[0]) {
    return res.status(400).json({ error: "Video and thumbnail are required" });
  }

  // Get user channel
  const channel = await Channel.findOne({ owner: userId });
  if (!channel) return res.status(400).json({ message: "Channel not found for the user" });

  // Upload to cloudinary
  const videoResult = await uploadVideoToCloudinary(req.files.video[0].buffer);
  const thumbnailResult = await uploadThumbnailToCloudinary(req.files.thumbnail[0].buffer);

  // Save video in DB
  const newVideo = await Video.create({
    title,
    description,
    category,
    uploader: userId,
    channel: channel._id,
    videoUrl: videoResult.secure_url,
    videoPublicId: videoResult.public_id,
    thumbnailUrl: thumbnailResult.secure_url,
    thumbnailPublicId: thumbnailResult.public_id,
    duration: Math.floor(videoResult.duration),
  });

  channel.videos.push(newVideo._id);
  await channel.save();

  res.status(201).json({ message: "Video uploaded successfully", video: newVideo });
});

// ==========================================
// Update video (replace files if provided)
// ==========================================
export const updateVideo = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id);
  if (!video) return res.status(404).json({ message: "Video not found" });

  // Only uploader can edit
  if (video.uploader.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Unauthorized to update this video" });
  }

  const { title, description, category } = req.body;

  // Replace video file if new one provided
  if (req.files?.video?.[0]) {
    await cloudinary.uploader.destroy(video.videoPublicId, { resource_type: "video" });
    const result = await streamUpload(req.files.video[0].buffer, {
      resource_type: "video",
      folder: "youtube-clone/videos",
    });
    video.videoUrl = result.secure_url;
    video.videoPublicId = result.public_id;
    video.duration = Math.floor(result.duration);
  }

  // Replace thumbnail if new one provided
  if (req.files?.thumbnail?.[0]) {
    await cloudinary.uploader.destroy(video.thumbnailPublicId);
    const result = await streamUpload(req.files.thumbnail[0].buffer, {
      folder: "youtube-clone/thumbnails",
    });
    video.thumbnailUrl = result.secure_url;
    video.thumbnailPublicId = result.public_id;
  }

  // Update metadata
  video.title = title || video.title;
  video.description = description || video.description;
  video.category = category || video.category;

  const updatedVideo = await video.save();
  res.json(updatedVideo);
});

// ==========================================
// Delete video (remove from DB + cloudinary)
// ==========================================
export const deleteVideo = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id);
  if (!video) return res.status(404).json({ message: "Video not found" });

  // Only uploader can delete
  if (video.uploader.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Unauthorized to delete this video" });
  }

  // Remove video + thumbnail from cloudinary
  await cloudinary.uploader.destroy(video.videoPublicId, { resource_type: "video" });
  await cloudinary.uploader.destroy(video.thumbnailPublicId);

  // Remove comments linked to video
  await Comment.deleteMany({ video: video._id });

  // Remove video record and unlink from channel
  await video.deleteOne();
  await Channel.findByIdAndUpdate(video.channel, { $pull: { videos: video._id } });

  res.status(200).json({ message: "Video deleted successfully" });
});

// ==========================================
// Like video (toggle like / remove dislike)
// ==========================================
export const likeVideo = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id);
  if (!video) return res.status(404).json({ message: "Video not found" });

  const userId = req.user._id.toString();

  if (video.likes.includes(userId)) {
    video.likes.pull(userId); // unlike
  } else {
    video.dislikes.pull(userId); // remove dislike if exists
    video.likes.push(userId);
  }

  await video.save();
  const updatedVideo = await Video.findById(video._id)
    .populate("channel", "channelName channelBanner")
    .populate("uploader", "username");

  res.json(updatedVideo);
});

// ==========================================
// Dislike video (toggle dislike / remove like)
// ==========================================
export const dislikeVideo = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id);
  if (!video) return res.status(404).json({ message: "Video not found" });

  const userId = req.user._id.toString();

  if (video.dislikes.includes(userId)) {
    video.dislikes.pull(userId); // remove dislike
  } else {
    video.likes.pull(userId); // remove like if exists
    video.dislikes.push(userId);
  }

  await video.save();
  const updatedVideo = await Video.findById(video._id)
    .populate("channel", "channelName channelBanner")
    .populate("uploader", "username");

  res.json(updatedVideo);
});

// ==========================================
// Increase views count
// ==========================================
export const increaseViews = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id);
  if (!video) return res.status(404).json({ message: "Video not found" });

  video.views += 1;
  await video.save();

  res.status(200).json(video);
});

// ==========================================
// Search videos by title/description
// ==========================================
export const searchVideos = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim() === "") {
    return res.status(400).json({ message: "Search term is required" });
  }

  const videos = await Video.find({
    $or: [
      { title: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
    ],
  })
    .sort({ createdAt: -1 })
    .populate("uploader", "username")
    .populate("channel", "channelName channelBanner");

  res.status(200).json(videos);
});
