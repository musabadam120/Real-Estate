// backend/routes/maintenanceRoutes.js
import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import {
  createMaintenanceRequest,
  listMaintenanceRequests,
  getMaintenanceRequestById,
  updateMaintenanceStatus,
} from "../controllers/maintenanceController.js";

const router = express.Router();

// Create (tenant, landlord, admin)
router.post("/", protect, authorize("tenant", "landlord", "admin"), createMaintenanceRequest);

// List (role-aware)
router.get("/", protect, listMaintenanceRequests);

// Get one (role-aware)
router.get("/:id", protect, getMaintenanceRequestById);

// Update status (landlord + admin)
router.put("/:id/status", protect, authorize("landlord", "admin"), updateMaintenanceStatus);

export default router;
