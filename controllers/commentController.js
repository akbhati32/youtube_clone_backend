import Comment from "../models/Comment.js";
import Video from "../models/Video.js";

// ============================
// Add comment to a video
// ============================
export const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const videoId = req.params.videoId;

    // Validate input
    if (!text || !videoId) {
      return res.status(404).json({ message: "Text and videoId are required" });
    }

    // Create comment
    const comment = await Comment.create({
      text,
      video: videoId,
      author: req.user._id,
    });

    // Link comment to video
    await Video.findByIdAndUpdate(videoId, { $push: { comments: comment._id } });

    // Populate author info
    const populatedComment = await comment.populate("author", "username _id");

    res.status(201).json({ message: "Comment added", comment: populatedComment });
  } catch (err) {
    res.status(500).json({ message: "Failed to add comment", err: err.message });
  }
};

// ============================
// Get all comments for a video
// ============================
export const getCommentsByVideo = async (req, res) => {
  try {
    const videoId = req.params.videoId;

    // Find comments, populate author, sort by newest first
    const comments = await Comment.find({ video: videoId })
      .populate("author", "username")
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch comments", error: err.message });
  }
};

// ============================
// Edit a comment
// ============================
export const editComment = async (req, res) => {
  try {
    const { text } = req.body;
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // Only author can edit
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized to edit this comment" });
    }

    // Update text if provided
    comment.text = text || comment.text;
    await comment.save();

    const populatedComment = await comment.populate("author", "username _id");
    res.json({ message: "Comment updated", comment: populatedComment });
  } catch (err) {
    res.status(500).json({ message: "Failed to edit comment", error: err.message });
  }
};

// ============================
// Delete a comment
// ============================
export const deleteComment = async (req, res) => {
  try {
    const { commentId, videoId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // Only author can delete
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized to delete this comment" });
    }

    // Remove comment reference from video
    await Video.findByIdAndUpdate(videoId, { $pull: { comments: comment._id } });

    // Delete comment
    await comment.deleteOne();

    res.json({ message: "Comment deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete comment", error: err.message });
  }
};
