import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  type: String,
  message: String,
  relatedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  seen: {
    type: Boolean,
    default: false
  },
 createdAt: {
  type: Date,
  default: Date.now,
  expires: 604800 // 7 days in seconds
}
});

export default mongoose.model("Notification", notificationSchema);
