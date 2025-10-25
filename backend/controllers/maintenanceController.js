// backend/controllers/maintenanceController.js
import MaintenanceRequest from "../models/MaintenanceRequest.js";
import { createNotification } from "./notificationController.js";

// @desc Create a new maintenance request
// @route POST /api/maintenance
// @access Tenant, Landlord, Admin
export const createMaintenanceRequest = async (req, res) => {
  try {
    const { property, issue, tenantId } = req.body;

    if (!property || !issue) {
      return res
        .status(400)
        .json({ message: "property and issue are required" });
    }

    // If admin passes tenantId, use that tenant, otherwise fallback to req.user
    const tenantToAssign =
      req.user.role === "admin" && tenantId ? tenantId : req.user._id;

    const maintenanceRequest = new MaintenanceRequest({
      tenant: tenantToAssign,
      property,
      issue,
    });

    const savedRequest = await maintenanceRequest.save();

    // Notify the tenant (or admin) about the new maintenance request
    await createNotification(
      "maintenance_request",
      `New maintenance issue: "${issue}"`,
      tenantToAssign,
      property
    );

    res.status(201).json(savedRequest);
  } catch (error) {
    console.error("Error creating maintenance request:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc List maintenance requests
// @route GET /api/maintenance
// @access Role-aware
export const listMaintenanceRequests = async (req, res) => {
  try {
    let requests;

    if (req.user.role === "tenant") {
      // Tenants see only their requests
      requests = await MaintenanceRequest.find({ tenant: req.user._id })
        .populate("property", "address name")
        .populate("tenant", "name email");
    } else if (req.user.role === "landlord") {
      // Landlords see requests for their properties
      requests = await MaintenanceRequest.find()
        .populate("property", "address name landlord")
        .populate("tenant", "name email");

      requests = requests.filter(
        (reqItem) =>
          reqItem.property &&
          reqItem.property.landlord.toString() === req.user._id.toString()
      );
    } else {
      // Admins see all
      requests = await MaintenanceRequest.find()
        .populate("property", "address name")
        .populate("tenant", "name email");
    }

    res.json(requests);
  } catch (error) {
    console.error("Error fetching maintenance requests:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc Get a single maintenance request by ID
// @route GET /api/maintenance/:id
// @access Role-aware
export const getMaintenanceRequestById = async (req, res) => {
  try {
    const request = await MaintenanceRequest.findById(req.params.id)
      .populate("property", "address name")
      .populate("tenant", "name email");

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Role-based access
    if (req.user.role === "tenant" && request.tenant._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (
      req.user.role === "landlord" &&
      request.property.landlord.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(request);
  } catch (error) {
    console.error("Error fetching request:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/// @desc Update maintenance status (with optional response note)
// @route PUT /api/maintenance/:id/status
// @access Landlord, Admin
export const updateMaintenanceStatus = async (req, res) => {
  try {
    const { status, response } = req.body;

    // Pull valid statuses directly from schema
    const validStatuses = MaintenanceRequest.schema.path("status").enumValues;

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    // Find the maintenance request
    const request = await MaintenanceRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Maintenance request not found" });
    }

    // Update status and/or response
    if (status) request.status = status;
    if (response !== undefined) request.response = response;

    const updatedRequest = await request.save();
    res.json(updatedRequest);
  } catch (error) {
    console.error("Error updating maintenance status:", error);
    res.status(500).json({ message: "Server error" });
  }
};
