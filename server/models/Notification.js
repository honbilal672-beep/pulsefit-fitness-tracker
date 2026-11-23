import mongoose, { Schema } from "mongoose";
const NotificationSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      index: true
    },
    title: {
      type: String,
      required: [true, "Notification title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"]
    },
    message: {
      type: String,
      required: [true, "Notification message is required"],
      trim: true,
      maxlength: [300, "Message cannot exceed 300 characters"]
    },
    type: {
      type: String,
      enum: ["workout", "goal", "follow", "reminder", "support", "system"],
      default: "system",
      index: true
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true
    },
    link: {
      type: String,
      trim: true
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);
NotificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });
const Notification = mongoose.model("Notification", NotificationSchema);
export {
  Notification
};
