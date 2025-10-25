// backend/models/Property.js
import mongoose from "mongoose";

const propertySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    landlord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    address: { type: String, required: true },
    price: { type: Number, required: true },
    status: {
      type: String,
      enum: ["available", "occupied", "maintenance"],
      default: "available",
    },

    // ✅ NEW FIELDS
    email: { type: String },
    phone: { type: String },
    nationality: { type: String },
    shareCode: { type: String },

    // Certificates (can be file URLs)
    gasSafety: { type: String },
    epc: { type: String },
    electricalCert: { type: String },
  },
  { timestamps: true }
);

const Property = mongoose.model("Property", propertySchema);
export default Property;
