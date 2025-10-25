// backend/routes/messageRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  sendMessage,
  getMessagesBetween,
  markMessagesRead,
  getConversations,
  getUnreadMessageCount
} from "../controllers/messageController.js";

const router = express.Router();

// Send a message
router.post("/", protect, sendMessage);

// Fetch messages between current user and another user
// Example: GET /api/messages?userId=<otherUserId>
router.get("/", protect, getMessagesBetween);

// Mark messages from a user as read
router.put("/mark-read", protect, markMessagesRead);

// Get conversation list with last message
router.get("/conversations", protect, getConversations);

// ✅ Get unread message count
router.get("/unread-count", protect, getUnreadMessageCount);

export default router;
