// backend/routes/fileRoutes.js
import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import {
  uploadFile,
  getFilesByProperty,
  deleteFile,
  assignFileToUser,
  getFiles,
  downloadFile, // ✅ new controller import
} from "../controllers/fileController.js";

const router = express.Router();

// ✅ Upload: tenant, landlord, admin
router.post(
  "/upload",
  protect,
  authorize("tenant", "landlord", "admin"),
  upload.single("file"),
  uploadFile
);

// ✅ List files for a specific property
router.get("/property/:propertyId", protect, getFilesByProperty);

// ✅ List all files (optional query ?userId=)
router.get("/", protect, authorize("admin", "landlord", "tenant"), getFiles);

// ✅ Assign a file to a user (admin only)
router.post("/:fileId/assign", protect, authorize("admin"), assignFileToUser);

// ✅ Delete file (uploader, landlord, or admin)
router.delete("/:id", protect, deleteFile);

// ✅ Download file (new endpoint)
router.get("/download/:id", protect, authorize("admin", "landlord", "tenant"), downloadFile);

router.get("/download/:id", protect, downloadFile);


export default router;
