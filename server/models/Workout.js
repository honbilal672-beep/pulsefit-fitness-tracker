import mongoose, { Schema } from "mongoose";
const ExerciseSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Exercise name is required"],
      trim: true
    },
    sets: {
      type: Number,
      required: true,
      min: [1, "Sets must be at least 1"],
      default: 3
    },
    reps: {
      type: Number,
      required: true,
      min: [0, "Reps cannot be negative"],
      default: 10
    },
    weight: {
      type: Number,
      default: 0,
      min: [0, "Weight cannot be negative"]
    },
    durationSeconds: {
      type: Number,
      default: 0
    },
    restSeconds: {
      type: Number,
      default: 60
    },
    notes: {
      type: String,
      trim: true
    }
  },
  { _id: true }
);
const WorkoutSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      index: true
    },
    title: {
      type: String,
      required: [true, "Workout routine title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"]
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"]
    },
    category: {
      type: String,
      enum: ["strength", "cardio", "flexibility", "hiit", "endurance", "calisthenics", "other"],
      default: "strength",
      index: true
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true
      }
    ],
    exercises: [ExerciseSchema],
    durationMinutes: {
      type: Number,
      default: 45,
      min: [1, "Duration must be at least 1 minute"]
    },
    isCompleted: {
      type: Boolean,
      default: false,
      index: true
    },
    completedAt: {
      type: Date,
      index: true
    },
    intensity: {
      type: String,
      enum: ["low", "medium", "high", "extreme"],
      default: "medium"
    },
    caloriesBurned: {
      type: Number,
      default: 0,
      min: [0, "Calories burned cannot be negative"]
    },
    notes: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);
WorkoutSchema.index({ user: 1, completedAt: -1 });
WorkoutSchema.index({ user: 1, category: 1 });
WorkoutSchema.index({ user: 1, tags: 1 });
const Workout = mongoose.model("Workout", WorkoutSchema);
export {
  Workout
};
