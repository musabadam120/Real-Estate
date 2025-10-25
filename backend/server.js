// backend/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import authRoutes from "./routes/authRoutes.js";
import propertyRoutes from "./routes/propertyRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import maintenanceRoutes from "./routes/maintenanceRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

dotenv.config();

const app = express();

// ===== Middleware =====
app.use(
  cors({
    origin: process.env.FRONTEND_URL, // require exact frontend origin
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" })); // ✅ Handles large JSON payloads safely

// ===== Routes =====
app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/users", userRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/notifications", notificationRoutes);

// ===== Test Route =====
app.get("/api/test", (req, res) => {
  res.status(200).json({ message: "✅ Backend running" });
});

// ===== Global Error Handler =====
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.stack);
  res.status(500).json({ message: "Internal Server Error", error: err.message });
});

// ===== MongoDB Connection =====
mongoose
  .connect(process.env.MONGO_URI, {
    // mongoose 7+ doesn’t need extra options, so we keep it clean
  })
  .then(() => {
    console.log("✅ MongoDB connected");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });
