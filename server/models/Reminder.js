import mongoose, { Schema } from "mongoose";
const ReminderSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      index: true
    },
    title: {
      type: String,
      required: [true, "Reminder title is required"],
      trim: true,
      maxlength: [80, "Title cannot exceed 80 characters"]
    },
    reminderType: {
      type: String,
      enum: ["workout", "meal", "goal", "water"],
      default: "workout",
      index: true
    },
    scheduleTime: {
      type: String,
      required: [true, "Schedule time is required (e.g. 08:30)"],
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, "Schedule time must be in HH:mm 24-hour format"]
    },
    daysOfWeek: {
      type: [Number],
      default: [1, 2, 3, 4, 5],
      // Monday - Friday by default
      validate: {
        validator: function(days) {
          return days.every((d) => d >= 0 && d <= 6);
        },
        message: "Days of week must be between 0 (Sunday) and 6 (Saturday)"
      }
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    notes: {
      type: String,
      trim: true
    },
    lastTriggeredAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);
ReminderSchema.index({ user: 1, isActive: 1 });
const Reminder = mongoose.model("Reminder", ReminderSchema);
export {
  Reminder
};
