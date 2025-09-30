import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cors from "cors";

// Routes
import authRoutes from "./routes/authRoutes.js";
import channelRoutes from "./routes/channelRoutes.js";
import videoRoutes from "./routes/videoRoutes.js";

// Error middleware
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

dotenv.config();
connectDB(); // Connect to MongoDB

const app = express();

// Enable CORS for frontend (allow credentials, methods, and headers)
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://youtube-clone-frontend-blue.vercel.app/",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Parse incoming JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/api/auth", authRoutes);       // Auth: register, login, getMe
app.use("/api/channels", channelRoutes); // Channels: create, update, delete, subscribe
app.use("/api/videos", videoRoutes);     // Videos: CRUD, like/dislike, comments

// Error Handling
app.use(notFound);     // 404 for unknown routes
app.use(errorHandler); // General error handler

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
