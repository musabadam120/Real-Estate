// backend/controllers/fileController.js
import cloudinary from "../config/cloudinary.js";
import File from "../models/File.js";
import Property from "../models/Property.js";
import axios from "axios";
import { createNotification } from "./notificationController.js";

// helper: upload buffer to Cloudinary using upload_stream
const streamUpload = (buffer, mimetype, originalname) =>
  new Promise((resolve, reject) => {
    const isImage = mimetype.startsWith("image/");
const resourceType = isImage ? "image" : "raw"; // keep this
const publicId = originalname.split('.').slice(0, -1).join('.') || originalname;


    const stream = cloudinary.uploader.upload_stream(
  {
    resource_type: resourceType,
    use_filename: true,       // ✅ keep original name
    unique_filename: false,   // ✅ don’t randomize
    public_id: publicId,      // ✅ actually store under the real file name (e.g. "yo")
  },
  (error, result) => {
    if (result) resolve(result);
    else reject(error);
  }
);
    stream.end(buffer);
  });

// POST /api/files/upload
export const uploadFile = async (req, res) => {
  try {
    // multer memoryStorage attaches file to req.file
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const { propertyId, fileType, description } = req.body;

    // Optional: ensure user has access to the property
    if (propertyId) {
      const prop = await Property.findById(propertyId);
      if (!prop) return res.status(404).json({ message: "Property not found" });

      // if tenant, ensure they are assigned
      if (req.user.role === "tenant" && prop.tenant?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Not allowed for this property" });
      }
      // if landlord, ensure they own it
      if (req.user.role === "landlord" && prop.landlord?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Not allowed for this property" });
      }
    }

    // Upload to Cloudinary
const result = await streamUpload(
  req.file.buffer,
  req.file.mimetype,
  req.file.originalname // ✅ send original filename
);



    // Save file record in MongoDB
    const fileDoc = await File.create({
      uploader: req.user._id,
      property: propertyId || null,
      fileUrl: result.secure_url,
      cloudinaryId: result.public_id,
      fileType: fileType || "other",
      description: description || "",
      originalName: req.file.originalname, // <-- ADD THIS
    });

    // create upload notification
    await createNotification(
      "file_uploaded",
      `${req.user.name} uploaded ${req.file.originalname}`,
      req.user._id
    );

    res.status(201).json(fileDoc);
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "Server error while uploading file" });
  }
};

// GET /api/files/property/:propertyId  (returns files for a property)
export const getFilesByProperty = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const prop = await Property.findById(propertyId);
    if (!prop) return res.status(404).json({ message: "Property not found" });

    // Access control
    if (req.user.role === "tenant" && prop.tenant?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }
    if (req.user.role === "landlord" && prop.landlord?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }
    // admin ok

    const files = await File.find({ property: propertyId }).populate("uploader", "name email");
    res.json(files);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/files/:fileId/assign
export const assignFileToUser = async (req, res) => {
  try {
    const { fileId } = req.params;
    const { userId } = req.body;

    const file = await File.findById(fileId);
    if (!file) return res.status(404).json({ message: "File not found" });

    file.assignedTo = userId;
    await file.save();

    const populated = await file.populate("assignedTo", "name email role");
    res.json(populated);
  } catch (err) {
    console.error("assignFileToUser error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/files?userId=xyz (optional)
export const getFiles = async (req, res) => {
  try {
    const query = {};
    if (req.query.userId) query.assignedTo = req.query.userId;
    const files = await File.find(query)
      .populate("uploader", "name email")
      .populate("assignedTo", "name email role");
    res.json(files);
  } catch (err) {
    console.error("getFiles error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/files/:id
export const deleteFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id).populate("property");
    if (!file) return res.status(404).json({ message: "File not found" });

    // Who can delete?
    const isUploader = file.uploader.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";
    // If file tied to property, landlord of the property can delete
    const isPropertyLandlord =
      file.property && file.property.landlord?.toString() === req.user._id.toString();

    if (!isUploader && !isAdmin && !isPropertyLandlord) {
      return res.status(403).json({ message: "Not authorized to delete this file" });
    }

    // Delete from Cloudinary (if cloudinaryId present)
    if (file.cloudinaryId) {
      try {
        await cloudinary.uploader.destroy(file.cloudinaryId, { resource_type: "auto" });
      } catch (err) {
        console.warn("Cloudinary destroy failed:", err);
        // continue to delete DB doc even if Cloudinary deletion fails (or handle differently)
      }
    }

    await file.deleteOne();
    res.json({ message: "File deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/files/download/:id
export const downloadFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ message: "File not found" });

    // Stream file from Cloudinary
    const response = await axios({
      url: file.fileUrl,
      method: "GET",
      responseType: "stream",
    });

    // Set headers so browser downloads properly
    res.setHeader("Content-Disposition", `attachment; filename="${file.originalName}"`);
    res.setHeader("Content-Type", response.headers["content-type"] || "application/octet-stream");

    // Pipe the stream
    response.data.pipe(res);
  } catch (err) {
    console.error("Download error:", err);
    res.status(500).json({ message: "Error downloading file" });
  }
};