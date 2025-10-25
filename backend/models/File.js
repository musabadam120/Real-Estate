// backend/models/File.js
import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    uploader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property"
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    fileUrl: {
      type: String,
      required: true
    },
    cloudinaryId: {
      type: String // public_id from Cloudinary for deletion
    },
    originalName: {
  type: String
},

    fileType: {
      type: String,
      enum: ["lease", "payment-receipt", "maintenance", "other"],
      default: "other"
    },
    description: {
      type: String
    }
  },
  { timestamps: true }
);

const File = mongoose.model("File", fileSchema);
export default File;
