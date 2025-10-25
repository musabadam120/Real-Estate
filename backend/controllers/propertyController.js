// controllers/propertyController.js
import Property from "../models/Property.js";
import User from "../models/User.js";
import { createNotification } from "./notificationController.js";

// ✅ Create property (landlord or admin)
export const createProperty = async (req, res) => {
  try {
    const {
      title,
      address,
      price,
      status,
      landlordId,
      tenantId,
      email,
      phone,
      nationality,
      shareCode,
      gasSafety,
      epc,
      electricalCert
    } = req.body;

    // If user is landlord, force landlord to be the logged-in user
    const landlord = req.user.role === "landlord" ? req.user._id : landlordId;
    if (!landlord) {
      return res.status(400).json({ message: "Landlord is required" });
    }

    const property = await Property.create({
      title,
      address,
      price,
      status,
      landlord,
      tenant: tenantId || null,
      email,
      phone,
      nationality,
      shareCode,
      gasSafety,
      epc,
      electricalCert
    });

    res.status(201).json(property);
  } catch (err) {
    console.error("❌ Error creating property:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get all properties (role-sensitive)
export const getProperties = async (req, res) => {
  try {
    let properties;
    if (req.user.role === "admin") {
      properties = await Property.find().populate("landlord tenant", "-password");
    } else if (req.user.role === "landlord") {
      properties = await Property.find({ landlord: req.user._id }).populate(
        "landlord tenant",
        "-password"
      );
    } else {
      // tenant
      properties = await Property.find({ tenant: req.user._id }).populate(
        "landlord tenant",
        "-password"
      );
    }
    res.json(properties);
  } catch (err) {
    console.error("❌ Error fetching properties:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get single property (with access control)
export const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate(
      "landlord tenant",
      "-password"
    );
    if (!property) return res.status(404).json({ message: "Property not found" });

    // Access: admin, landlord-owner, or assigned tenant
    const isLandlord =
      property.landlord &&
      property.landlord._id.toString() === req.user._id.toString();
    const isTenant =
      property.tenant &&
      property.tenant._id.toString() === req.user._id.toString();

    if (req.user.role !== "admin" && !isLandlord && !isTenant) {
      return res.status(403).json({ message: "Forbidden" });
    }

    res.json(property);
  } catch (err) {
    console.error("❌ Error fetching property:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Update property (admin or landlord-owner)
export const updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: "Property not found" });

    // If landlord, ensure they own the property
    if (
      req.user.role === "landlord" &&
      property.landlord.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Fields allowed to be updated
    const updatableFields = [
      "title",
      "address",
      "price",
      "status",
      "tenant",
      "email",
      "phone",
      "nationality",
      "shareCode",
      "gasSafety",
      "epc",
      "electricalCert"
    ];

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) property[field] = req.body[field];
    });

    await property.save();
    const updated = await Property.findById(property._id).populate(
      "landlord tenant",
      "-password"
    );
    res.json(updated);
  } catch (err) {
    console.error("❌ Error updating property:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Delete property (admin or landlord-owner)
export const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: "Property not found" });

    if (
      req.user.role === "landlord" &&
      property.landlord.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await property.deleteOne();
    res.json({ message: "Property deleted" });
  } catch (err) {
    console.error("❌ Error deleting property:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Assign tenant to property (admin or landlord-owner)
export const assignTenant = async (req, res) => {
  try {
    const { tenantId } = req.body;
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: "Property not found" });

    if (
      req.user.role === "landlord" &&
      property.landlord.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Validate tenant exists and has role "tenant"
    const tenantUser = await User.findById(tenantId);
    if (!tenantUser || tenantUser.role !== "tenant") {
      return res
        .status(400)
        .json({ message: "Provided tenantId is not a valid tenant" });
    }

    property.tenant = tenantId;
    property.status = "occupied";
    await property.save();

    // notify tenant assignment (assumes tenantUser variable exists in this scope)
    await createNotification(
      "property_assigned",
      `${tenantUser.name} was assigned to property ${property.title}`,
      tenantUser._id
    );

    const updated = await Property.findById(property._id).populate(
      "landlord tenant",
      "-password"
    );
    res.json(updated);
  } catch (err) {
    console.error("❌ Error assigning tenant:", err);
    res.status(500).json({ message: "Server error" });
  }
};
