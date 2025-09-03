import mongoose from "mongoose";

const videoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true }, // Video title
    description: { type: String }, // Video description
    category: { type: String, required: true }, // Video category (e.g. Music, Gaming)
    videoUrl: { type: String, required: true }, // Cloudinary video URL
    videoPublicId: { type: String, required: true }, // Cloudinary video ID (for deletion)
    thumbnailUrl: { type: String, required: true }, // Cloudinary thumbnail URL
    thumbnailPublicId: { type: String, required: true }, // Cloudinary thumbnail ID
    uploader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // User who uploaded
      required: true,
    },
    channel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel", // Channel this video belongs to
      required: true,
    },
    likes: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User" } // Users who liked
    ],
    dislikes: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User" } // Users who disliked
    ],
    comments: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Comment" } // Comments on video
    ],
    duration: { type: Number, required: true }, // Video length (in seconds)
    views: { type: Number, default: 0 }, // View count
  },
  { timestamps: true } // Auto add createdAt & updatedAt
);

export default mongoose.model("Video", videoSchema);
