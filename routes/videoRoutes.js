import express from "express";
import {
  deleteVideo,
  dislikeVideo,
  getAllVideos,
  getVideoById,
  getVideosByLoggedInUser,
  increaseViews,
  likeVideo,
  searchVideos,
  updateVideo,
  uploadVideo,
} from "../controllers/videoController.js";

import { protect } from "../middleware/authMiddleware.js";
import { uploadBoth } from "../middleware/multer.js";

import commentRoutes from "./commetRoutes.js";

const router = express.Router();

// Nested comments route for a specific video
router.use("/:videoId/comments", commentRoutes);

// Search videos
router.get("/search", searchVideos);

// Get all videos
router.get("/", getAllVideos);

// Get videos uploaded by the logged-in user
router.get("/user", protect, getVideosByLoggedInUser);

// Upload a new video (must be logged in, with video and thumbnail)
router.post("/upload", protect, uploadBoth, uploadVideo);

// Get a single video by ID
router.get("/:id", getVideoById);

// Update a video (with optional new video/thumbnail upload)
router.put("/:id", protect, uploadBoth, updateVideo);

// Delete a video
router.delete("/:id", protect, deleteVideo);

// Like/dislike
router.post("/:id/like", protect, likeVideo);
router.post("/:id/dislike", protect, dislikeVideo);

// Increase views
router.patch("/:id/views", increaseViews);

export default router;


