import multer from "multer";

const storage = multer.memoryStorage(); // Store files in memory buffer

// File filter to allow only specific formats
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "video/mp4",
    "video/quicktime",  // MOV
    "video/x-msvideo",  // AVI
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true); // Accept file
  } else {
    cb(new Error("Only JPEG, PNG images and MP4, MOV, AVI videos are allowed!"));
  }
};

// Middleware for uploading both video + thumbnail
export const uploadBoth = multer({ storage, fileFilter }).fields([
  { name: "video", maxCount: 1 },
  { name: "thumbnail", maxCount: 1 },
]);

// Middleware for single profile picture upload
export const uploadProfile = multer({ storage, fileFilter }).single("profilePic");

// Middleware for single banner upload
export const uploadBanner = multer({ storage, fileFilter }).single("banner");
