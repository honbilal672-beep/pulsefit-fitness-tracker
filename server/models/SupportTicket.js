import mongoose, { Schema } from "mongoose";
const TicketMessageSchema = new Schema(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    senderName: {
      type: String,
      required: true
    },
    senderRole: {
      type: String,
      enum: ["user", "admin"],
      required: true
    },
    message: {
      type: String,
      required: [true, "Message text is required"],
      trim: true,
      maxlength: [2e3, "Message cannot exceed 2000 characters"]
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: true }
);
const SupportTicketSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      index: true
    },
    subject: {
      type: String,
      required: [true, "Ticket subject is required"],
      trim: true,
      maxlength: [120, "Subject cannot exceed 120 characters"]
    },
    category: {
      type: String,
      enum: ["bug", "account", "feedback", "billing", "general"],
      default: "general",
      index: true
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
      index: true
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "closed"],
      default: "open",
      index: true
    },
    messages: [TicketMessageSchema],
    lastRepliedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);
SupportTicketSchema.index({ user: 1, status: 1 });
SupportTicketSchema.index({ status: 1, updatedAt: -1 });
const SupportTicket = mongoose.model("SupportTicket", SupportTicketSchema);
export {
  SupportTicket
};
