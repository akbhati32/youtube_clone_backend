import express from "express";
import { 
  createChannel, 
  deleteChannel, 
  getChannel, 
  toggleSubscription, 
  updateChannel 
} from "../controllers/channelController.js";

import { protect } from "../middleware/authMiddleware.js";
import { uploadBanner } from "../middleware/multer.js";

const router = express.Router();

// Create a new channel (protected, with optional banner upload)
router.post("/", protect, uploadBanner, createChannel);

// Get channel details by ID (public)
router.get("/:id", getChannel);

// Update channel info (protected, owner only, with banner upload)
router.put("/:id", protect, uploadBanner, updateChannel);

// Delete a channel (protected, owner only)
router.delete("/:id", protect, deleteChannel);

// Subscribe/unsubscribe to a channel (protected)
router.post("/:id/subscribe", protect, toggleSubscription);

export default router;
