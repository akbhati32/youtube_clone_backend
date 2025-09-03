import express from "express";
import {
  registerUser,
  loginUser,
  getMe,
} from "../controllers/authController.js";
import { uploadProfile } from "../middleware/multer.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Register a new user (with optional profile picture upload)
router.post("/register", uploadProfile, registerUser);

// Login user and return JWT token
router.post("/login", loginUser);

// Get logged-in user data (protected route)
router.get("/me", protect, getMe);

export default router;
