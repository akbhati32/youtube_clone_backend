import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import streamifier from "streamifier";

dotenv.config();

// Configure cloudinary with credentials from .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload video to cloudinary under "youtube-clone/videos"
const uploadVideoToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "video",
        folder: "youtube-clone/videos",
      },
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
    // Convert buffer to stream and upload
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

// Upload thumbnail image to cloudinary under "youtube-clone/thumbnails"
const uploadThumbnailToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "image",
        folder: "youtube-clone/thumbnails",
      },
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

// Upload profile picture to cloudinary under "youtube-clone/profiles"
const uploadProfilePicToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "youtube-clone/profiles",
      },
      (err, result) => {
        if (result) resolve(result);
        else reject(err);
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

// Upload channel banner to cloudinary under "youtube-clone/channel-banners"
const uploadChannelBannerToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "youtube-clone/channel-banners",
      },
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

// Export cloudinary instance and upload functions
export {  
  cloudinary,
  uploadVideoToCloudinary,
  uploadThumbnailToCloudinary,
  uploadProfilePicToCloudinary,
  uploadChannelBannerToCloudinary,
};


