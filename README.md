# 🎬 YouTube Clone - Backend

This is the **backend** for a full-stack YouTube Clone built with **Node.js**, **Express**, **MongoDB**, and **Cloudinary**. 
It provides a RESTful API for the frontend, supporting authentication, video uploads, comments, channel management, and more.

---

## Github Repository

🔗 [Youtube Clone Backend](https://github.com/akbhati32/youtube_clone_backend.git)

---

## Live Link

🔗 [Youtube Clone Frontend](https://youtube-clone-frontend-blue.vercel.app)
🔗 [Youtube Clone Backend](https://youtube-clone-backend-zmct.onrender.com)

---


## Video Demo
- [video demo](https://res.cloudinary.com/dqnqkvncm/video/upload/v1757001845/Final-VEED_eymtso.mp4)

---

## 🚀 Features

- 🔑 User Authentication (Register/Login with JWT)
- 📺 Video Upload, Fetch, Update, Delete
- 💬 Comments on videos
- 👍 Like/Dislike system
- 📡 Search & Filter videos
- 👤 User profiles & channels
- 🛡️ Secure routes with JWT & middleware
- ⚡ Error handling & validation
- 📊 Redux State Management
- 🌩️ Cloudinary for Image/Video Storage

---

## 🛠 Tech Stack

- **Node.js** & **Express** – REST API
- **MongoDB** & **Mongoose** – NoSQL Database
- **Cloudinary** – Media storage (videos, images)
- **Multer** & **Streamifier** – File uploads
- **JWT** – Secure authentication
- **bcrypt** – Password hashing
- **dotenv** – Environment variables

---

## 🧩 Project Setup

### 1. Clone the Repository

```bash
git clone https://github.com/akbhati32/youtube_clone_backend.git
cd youtube_clone_backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/youtube_clone
JWT_SECRET=your_jwt_secret_here
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

## Environment Variables

This project uses environment variables to configure sensitive information.

1. Create a `.env` file in the root directory of the project.
2. Copy the contents from `.env` and fill in the values according to you.

### 4. Set up MongoDB Locally

- Download MongoDB and install MongoDB Compass: [https://www.mongodb.com/products/self-managed/community-edition](https://www.mongodb.com/products/self-managed/community-edition)
- Start MongoDB Server
- Open MongoDB Compass
- Connect using:

```
mongodb://localhost:27017/youtube_clone
```

- Create a database called `youtube_clone` manually or it will be auto-created on app start.

---

## Development Commands

```bash
npm run dev     # Start server with nodemon for auto-reloading
```

---

## Production Commands

```bash
npm start       # Runs app in production mode (without nodemon)
```

---

## 🔌 API Endpoints

### Auth Routes – `/api/auth`

- `POST /register` – Register new user
- `POST /login` – Login user and return token

### Video Routes – `/api/videos`

- `GET /search` – Search videos   
- `GET /` – Get all videos
- `GET /user` - Get videos uploaded by logged-in user
- `GET /:id` - Get a single video by ID     
- `POST /upload` – Upload a new video (with thumbnail & video)  
- `PUT /:id` – Update a video (protected, with new files)  
- `DELETE /:id` – Delete a video (protected)  
- `POST /:id/like` – Like or unlike a video  
- `POST /:id/dislike` – Dislike or remove dislike  
- `PATCH /:id/views` – Increase view count

### Comment Routes – `/api/videos/:videoId/comments`

- `POST /` – Add a comment (protected)  
- `GET /` – Get comments on a video  
- `PUT /:commentId` – Edit a comment (protected)  
- `DELETE /:commentId` – Delete a comment (protected)  

### Channel Routes – `/api/channels`

- `POST /` – Create a channel (with banner)  
- `GET /:id ` – Get a channel by ID
- `PUT /:id ` – Update channel info (with banner)
- `DELETE /:id ` – Delete a channel
- `POST /:id/subscribe` – Toggle subscription to a channel
---

## 📁 Folder Structure

```
youtube_clone_backend/  # Express.js backend
├── config/             # Database & environment config
├── controllers/        # Route controllers (business logic)
├── middleware/         # Custom middlewares (auth, error handling, etc.)
├── models/             # Mongoose models (User, Video, Comment, etc.)
├── routes/             # Express routes (auth, videos, comments, etc.)
├── utils/              # Helper functions
├── .env                # Environment variables
├── server.js           # Entry point
```

---

## 📦 Dependencies

- Express
- Mongoose
- Multer
- Cloudinary SDK
- JWT
- Dotenv

---

## 📄 License
Feel free to use and modify it for your own learning or project needs.

## 🙋‍♂️ Author
**Aslam Bhati**

---
