import mongoose, { Schema } from "mongoose";
const ProgressEntrySchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      index: true
    },
    date: {
      type: Date,
      required: [true, "Entry date is required"],
      default: Date.now,
      index: true
    },
    weight: {
      type: Number,
      required: [true, "Weight is required"],
      min: [20, "Weight must be at least 20"],
      max: [500, "Weight cannot exceed 500"]
    },
    bodyFatPercentage: {
      type: Number,
      min: [2, "Body fat must be at least 2%"],
      max: [70, "Body fat cannot exceed 70%"]
    },
    measurements: {
      chest: { type: Number, default: 0 },
      waist: { type: Number, default: 0 },
      hips: { type: Number, default: 0 },
      arms: { type: Number, default: 0 },
      thighs: { type: Number, default: 0 },
      neck: { type: Number, default: 0 },
      calves: { type: Number, default: 0 }
    },
    performanceMetrics: {
      runTimeMinutes: { type: Number, default: 0 },
      maxBench: { type: Number, default: 0 },
      maxSquat: { type: Number, default: 0 },
      maxDeadlift: { type: Number, default: 0 },
      maxPullups: { type: Number, default: 0 },
      restingHeartRate: { type: Number, default: 0 }
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notes cannot exceed 500 characters"]
    },
    photoUrl: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);
ProgressEntrySchema.index({ user: 1, date: -1 });
const ProgressEntry = mongoose.model("ProgressEntry", ProgressEntrySchema);
export {
  ProgressEntry
};
