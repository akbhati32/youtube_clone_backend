import express from "express";

import {
  addComment,
  deleteComment,
  editComment,
  getCommentsByVideo,
} from "../controllers/commentController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router({ mergeParams: true });

// Add a new comment to a video (protected)
router.post("/", protect, addComment);

// Get all comments for a video (public)
router.get("/", getCommentsByVideo);

// Edit a specific comment (protected, author only)
router.put("/:commentId", protect, editComment);

// Delete a specific comment (protected, author only)
router.delete("/:commentId", protect, deleteComment);

export default router;
