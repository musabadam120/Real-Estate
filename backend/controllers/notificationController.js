import Notification from "../models/Notification.js";

// 🧩 ADMIN — Fetch all notifications
export const getNotifications = async (req, res) => {
  try {
    // Fetch latest 15 notifications
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(15)
      .populate("relatedUser", "name role");

    res.status(200).json(notifications);
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

// 🧩 TENANT — Fetch personal notifications
export const getTenantNotifications = async (req, res) => {
  try {
    const tenantId = req.params.id;

    const notifications = await Notification.find({
      $or: [
        { relatedUser: tenantId },   // direct notifications
        { targetRole: "tenant" }     // general tenant-wide ones, if you ever add them
      ]
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("relatedUser", "name role");

    res.status(200).json(notifications);
  } catch (err) {
    console.error("Error fetching tenant notifications:", err);
    res.status(500).json({ message: "Failed to fetch tenant notifications" });
  }
};

// 🧩 Helper — Create notifications from other controllers
export const createNotification = async (type, message, relatedUser = null, relatedProperty = null) => {
  try {
    await Notification.create({ type, message, relatedUser, relatedProperty });
  } catch (err) {
    console.error("Notification error:", err.message);
  }
};
