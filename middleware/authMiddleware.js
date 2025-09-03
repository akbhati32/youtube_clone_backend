import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Middleware to protect routes (JWT authentication)
export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check if token exists and starts with "Bearer"
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1]; // Extract token

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user (exclude password)
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Attach user ID to request (you can attach full user if needed)
    req.user = { _id: decoded.userId };

    next(); // Continue to next middleware/controller
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
