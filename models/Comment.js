import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    text: { type: String, required: true }, // Comment text
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // User who wrote the comment
      required: true,
    },
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video", // Video the comment belongs to
      required: true,
    },
  },
  { timestamps: true } // Auto add createdAt & updatedAt
);

export default mongoose.model("Comment", commentSchema);
