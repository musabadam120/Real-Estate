import express from "express";
import {
  getAllUsers,
  getMyProfile,
  getLandlordTenants,
  getUserById,
  updateUser,
  deleteUser,
  updateMyProfile,
  getRecentViewers
} from "../controllers/userController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🧍 Logged-in user routes should come first
router.get("/me", protect, getMyProfile);
router.put("/me", protect, updateMyProfile);

// Admin-only routes
router.get("/", protect, authorize("admin"), getAllUsers);
router.get("/recent-viewers", protect, authorize("admin"), getRecentViewers);
router.get("/tenants", protect, authorize("landlord"), getLandlordTenants);
router.get("/:id", protect, authorize("admin"), getUserById);
router.put("/:id", protect, authorize("admin"), updateUser);
router.delete("/:id", protect, authorize("admin"), deleteUser);

export default router;
