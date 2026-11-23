import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username cannot exceed 30 characters"],
      match: [/^[a-zA-Z0-9_.-]+$/, "Username can only contain alphanumeric characters, dots, underscores, and hyphens"],
      index: true
    },
    email: {
      type: String,
      required: [true, "Email address is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, "Please provide a valid email address"],
      index: true
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false
    },
    name: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      maxlength: [60, "Name cannot exceed 60 characters"]
    },
    profilePicture: {
      type: String,
      default: ""
    },
    age: {
      type: Number,
      min: [10, "Age must be at least 10"],
      max: [120, "Age cannot exceed 120"],
      default: 25
    },
    gender: {
      type: String,
      enum: ["male", "female", "non-binary", "other", "prefer_not_to_say"],
      default: "prefer_not_to_say"
    },
    height: {
      type: Number,
      min: [30, "Height must be at least 30 cm"],
      max: [300, "Height cannot exceed 300 cm"],
      default: 175
    },
    weight: {
      type: Number,
      min: [20, "Weight must be at least 20 kg"],
      max: [500, "Weight cannot exceed 500 kg"],
      default: 70
    },
    fitnessGoal: {
      type: String,
      enum: ["weight_loss", "muscle_gain", "endurance", "maintenance", "flexibility", "general_health"],
      default: "general_health"
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      index: true
    },
    isProfilePublic: {
      type: Boolean,
      default: false
    },
    settings: {
      units: {
        type: String,
        enum: ["metric", "imperial"],
        default: "metric"
      },
      theme: {
        type: String,
        enum: ["light", "dark", "system"],
        default: "dark"
      },
      notifications: {
        workouts: { type: Boolean, default: true },
        meals: { type: Boolean, default: true },
        goals: { type: Boolean, default: true },
        reminders: { type: Boolean, default: true },
        social: { type: Boolean, default: true }
      }
    },
    consentAcceptedAt: {
      type: Date,
      default: Date.now
    },
    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    following: [
      {
        type: Schema.Types.ObjectId,
        ref: "User"
      }
    ]
  },
  {
    timestamps: true
  }
);
UserSchema.pre("save", async function() {
  if (!this.isModified("password") || !this.password) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});
UserSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};
UserSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};
const User = mongoose.model("User", UserSchema);
export {
  User
};
