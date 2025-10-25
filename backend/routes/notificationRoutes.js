import express from "express";
import {
  getNotifications,
  getTenantNotifications, // 👈 add this controller
} from "../controllers/notificationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * Admin route — all notifications
 */
router.get(
  "/",
  protect,
  async (req, res, next) => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }
    next();
  },
  getNotifications
);

/**
 * Tenant route — personal notifications
 */
router.get("/tenant/:id", protect, getTenantNotifications);

export default router;
