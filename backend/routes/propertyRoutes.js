// propertyRoutes.js
import express from "express";
import {
  createProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  assignTenant
} from "../controllers/propertyController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create property: landlord or admin
router.post("/", protect, authorize("landlord", "admin"), createProperty);

// Get properties (admin/landlord/tenant will get role-specific results)
router.get("/", protect, getProperties);

// Get single property
router.get("/:id", protect, getPropertyById);

// Update property
router.put("/:id", protect, authorize("landlord", "admin"), updateProperty);

// Delete property
router.delete("/:id", protect, authorize("landlord", "admin"), deleteProperty);

// Assign tenant
router.put("/:id/assign-tenant", protect, authorize("landlord", "admin"), assignTenant);

export default router;
