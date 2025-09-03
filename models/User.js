import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true }, // Unique username
    email: { type: String, required: true, unique: true }, // Unique email
    password: { type: String, required: true }, // Hashed password
    profilePic: { type: String }, // Profile picture URL (Cloudinary)
    channels: [{ type: mongoose.Schema.Types.ObjectId, ref: "Channel" }], // Channels owned by user
    subscriptions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Channel", // Channels this user subscribed to
      },
    ],
  },
  { timestamps: true } // Auto add createdAt & updatedAt
);

export default mongoose.model("User", userSchema);
