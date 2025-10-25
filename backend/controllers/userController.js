// backend/controllers/userController.js
import User from "../models/User.js";
import Property from "../models/Property.js";
import bcrypt from "bcryptjs";
import { createNotification } from "./notificationController.js";

// Admin: get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get logged-in user's profile
export const getMyProfile = async (req, res) => {
  try {
    res.json(req.user); // set in protect middleware (already excludes password)
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Landlord: get tenants assigned to this landlord's properties
export const getLandlordTenants = async (req, res) => {
  try {
    // find properties owned by landlord that have tenants
    const properties = await Property.find({ landlord: req.user._id, tenant: { $ne: null } }).populate("tenant", "-password");
    // extract tenants
    const tenants = properties.map((p) => p.tenant).filter(Boolean);
    // remove duplicates by _id (if any)
    const unique = [];
    const map = new Map();
    tenants.forEach(t => {
      if (!map.has(t._id.toString())) {
        map.set(t._id.toString(), true);
        unique.push(t);
      }
    });
    res.json(unique);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin: get user by id
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin: update user (e.g., role change)
export const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { name, email, role } = req.body;
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (role !== undefined) user.role = role;

    await user.save();
    res.json({ message: "User updated", user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin: delete user
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // before deleting
    await createNotification("user_deleted", `User ${user.name} was deleted`, user._id);

    // proceed to delete user
    await user.remove();
    res.json({ message: "User removed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Logged-in user: update own profile (name/email/password)
export const updateMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const { name, email, password } = req.body;
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    // create profile updated notification
    await createNotification(
      "profile_updated",
      `${user.name} updated their profile settings`,
      user._id
    );

    res.json({ message: "Profile updated", user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin: get recent viewers
export const getRecentViewers = async (req, res) => {
  try {
    const users = await User.find()
      .sort({ lastActiveAt: -1 }) // newest first
      .limit(5) // show top 5 most recent
      .select("name email role lastActiveAt");

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

