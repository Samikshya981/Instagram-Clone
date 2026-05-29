import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import userRoute from "./routes/user.route.js";
import postRoute from "./routes/post.route.js";
import messageRoute from "./routes/message.route.js";
import storyRoute from "./routes/story.route.js";
import notificationRoute from "./routes/notification.route.js";
import { app, server } from "./socket/socket.js";
import path from "path";
import rateLimit from "express-rate-limit";

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 8000;
const __dirname = path.resolve();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again after 15 minutes"
});

// ------------------- MIDDLEWARES -------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/api/', limiter);

// CORS Configuration
const corsOptions = {
  origin: "http://localhost:5173", 
  credentials: true,
};

app.use(cors(corsOptions));

// ------------------- API ROUTES -------------------
app.use("/api/v1/user", userRoute);
app.use("/api/v1/post", postRoute);
app.use("/api/v1/message", messageRoute);
app.use("/api/v1/story", storyRoute);
app.use("/api/v1/notification", notificationRoute);

// ------------------- FRONTEND SERVING -------------------
// app.use(express.static(path.join(__dirname, "frontend", "dist")));

// app.use((req, res) => {
//   res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
// });

// ------------------- DATABASE + SERVER START -------------------
connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`✅ Server running at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ Database connection failed:", error);
  });