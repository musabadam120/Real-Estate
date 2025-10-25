// backend/models/MaintenanceRequest.js
import mongoose from "mongoose";

const maintenanceRequestSchema = new mongoose.Schema(
  {
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true
    },
    issue: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "resolved"],
      default: "pending"
    },
    response: {
      type: String
    }
  },
  { timestamps: true }
);

const MaintenanceRequest = mongoose.model(
  "MaintenanceRequest",
  maintenanceRequestSchema
);
export default MaintenanceRequest;
