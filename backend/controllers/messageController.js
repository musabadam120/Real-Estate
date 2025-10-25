// backend/controllers/messageController.js
import mongoose from "mongoose";
import Message from "../models/Message.js";
import User from "../models/User.js";
import Property from "../models/Property.js";
import { createNotification } from "./notificationController.js";

const ObjectId = mongoose.Types.ObjectId;

/**
 * Helper: Get all allowed user IDs current user can chat with
 */
async function getAllowedUsers(currentUser) {
  // Admins can message anyone -> return null (no restriction)
  if (currentUser.role === "admin") return null;

  // Find properties where current user is landlord or tenant
  const properties = await Property.find({
    $or: [{ landlord: currentUser._id }, { tenant: currentUser._id }],
  });

  const allowedUsers = new Set();

  properties.forEach((p) => {
    if (p.landlord) allowedUsers.add(String(p.landlord));
    if (p.tenant) allowedUsers.add(String(p.tenant));
  });

  // Always allow chatting with admins
  const admins = await User.find({ role: "admin" }, "_id");
  admins.forEach((a) => allowedUsers.add(String(a._id)));

  return allowedUsers;
}

// POST /api/messages
export const sendMessage = async (req, res) => {
  try {
    const sender = req.user;
    const { receiverId, content } = req.body;

    if (!receiverId || !content) {
      return res
        .status(400)
        .json({ message: "receiverId and content are required" });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) return res.status(404).json({ message: "Receiver not found" });

    // ✅ Permission check
    const allowedUsers = await getAllowedUsers(sender);
    if (allowedUsers && !allowedUsers.has(String(receiver._id))) {
      return res.status(403).json({ message: "You are not allowed to message this user." });
    }

    const message = await Message.create({
      sender: sender._id,
      receiver: receiverId,
      content,
    });

    const populated = await Message.findById(message._id).populate(
      "sender receiver",
      "name email role"
    );

    // Notify receiver about the new message
    await createNotification("message", `New message from ${sender.name}`, sender._id);

    res.status(201).json(populated);
  } catch (err) {
    console.error("sendMessage error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/messages?userId=<otherUserId>&limit=50&skip=0
export const getMessagesBetween = async (req, res) => {
  try {
    const me = req.user;
    const otherId = req.query.userId;
    if (!otherId)
      return res.status(400).json({ message: "userId query param required" });

    const other = await User.findById(otherId);
    if (!other) return res.status(404).json({ message: "User not found" });

    // ✅ Permission check
    const allowedUsers = await getAllowedUsers(me);
    if (allowedUsers && !allowedUsers.has(String(other._id))) {
      return res.status(403).json({ message: "You are not allowed to view this conversation." });
    }

    const limit = Math.min(parseInt(req.query.limit || "100", 10), 500);
    const skip = parseInt(req.query.skip || "0", 10);

    const messages = await Message.find({
      $or: [
        { sender: me._id, receiver: otherId },
        { sender: otherId, receiver: me._id },
      ],
    })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .populate("sender receiver", "name email role");

    res.json(messages);
  } catch (err) {
    console.error("getMessagesBetween error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/messages/mark-read
// Body: { from: "<senderId>" }
export const markMessagesRead = async (req, res) => {
  try {
    const me = req.user._id.toString();
    const { from } = req.body;
    if (!from) return res.status(400).json({ message: "from field required" });

    const other = await User.findById(from);
    if (!other) return res.status(404).json({ message: "User not found" });

    // ✅ Permission check
    const allowedUsers = await getAllowedUsers(req.user);
    if (allowedUsers && !allowedUsers.has(String(other._id))) {
      return res.status(403).json({ message: "You are not allowed to mark these messages as read." });
    }

    const result = await Message.updateMany(
      { sender: from, receiver: me, read: false },
      { $set: { read: true } }
    );

    res.json({ message: "Messages marked read", modifiedCount: result.modifiedCount });
  } catch (err) {
    console.error("markMessagesRead error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/messages/conversations
export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    let conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: new ObjectId(userId) }, { receiver: new ObjectId(userId) }],
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$sender", new ObjectId(userId)] },
              "$receiver",
              "$sender",
            ],
          },
          lastMessage: { $first: "$$ROOT" },
        },
      },
    ]);

    // Populate users
    const userIds = conversations.map((c) => c._id);
    const users = await User.find({ _id: { $in: userIds } }, "name email role");
    const userMap = Object.fromEntries(users.map((u) => [String(u._id), u]));

    // ✅ Filter conversations by permission (except for admin)
    const allowedUsers = await getAllowedUsers(req.user);
    conversations = conversations.filter((c) => {
      if (!allowedUsers) return true; // admin sees all
      return allowedUsers.has(String(c._id));
    });

    const result = conversations.map((c) => ({
      user: userMap[String(c._id)],
      lastMessage: c.lastMessage,
    }));

    res.json(result);
  } catch (error) {
    console.error("getConversations error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/messages/unread-count
export const getUnreadMessageCount = async (req, res) => {
  try {
    const userId = req.user._id;

    // Count all messages sent TO this user that are still unread
    const count = await Message.countDocuments({ receiver: userId, read: false });

    res.json({ unreadCount: count });
  } catch (error) {
    console.error("getUnreadMessageCount error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

