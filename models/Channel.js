import mongoose from "mongoose";

const channelSchema = new mongoose.Schema(
  {
    channelId: { type: String, required: true, unique: true }, // Unique short ID
    channelName: { type: String, required: true }, // Channel name
    description: { type: String }, // Channel description/bio
    channelBanner: { type: String }, // Banner image URL (Cloudinary)
    bannerPublicId: { type: String }, // Banner image Cloudinary ID (for deletion)
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to User (channel creator)
      required: true,
    },
    subscribes: { type: Number, default: 0 }, // Subscriber count
    subscriberList: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // List of subscribers
    videos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }], // Videos uploaded in this channel
  },
  { timestamps: true } // Auto add createdAt & updatedAt
);

export default mongoose.model("Channel", channelSchema);
