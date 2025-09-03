import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { uploadProfilePicToCloudinary } from "../config/cloudinary.js";

// ============================
// Register new user
// ============================
export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const profile = req.file;
    
    // Check if email already exists
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Check if username already exists
    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({ message: "Username already taken" });
    }

    // Upload profile image to Cloudinary (if provided)
    let uploadedProfileImage;
    if (profile) {
      try {
        uploadedProfileImage = await uploadProfilePicToCloudinary(profile.buffer);
      } catch (cloudErr) {
        return res.status(500).json({ message: "Image upload failed", error: cloudErr.message });
      }
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      profile: uploadedProfileImage?.secure_url || ""   // Store uploaded image URL or empty string
    });

    // Save user to database
    const savedUser = await newUser.save();
    
    res.status(201).json({ message: "User created successfully", user: savedUser });
  } catch (err) {
    res.status(500).json({ message: "Registration failed", error: err.message });
  }
};

// ============================
// Login user
// ============================
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email and load channels
    const user = await User.findOne({ email }).populate("channels");
    if (!user) return res.status(404).json({ message: "User not found" });

    // Compare entered password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    // Generate JWT token (valid for 1 day)
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // Send response with token and user data
    res.json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profilePic: user.profilePic,
        channels: user.channels,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ============================
// Get logged-in user info
// ============================
export const getMe = async (req, res) => {
  try {
    // Get user by ID, exclude password, and populate channels
    const user = await User.findById(req.user._id)
      .select("-password")
      .populate("channels");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
