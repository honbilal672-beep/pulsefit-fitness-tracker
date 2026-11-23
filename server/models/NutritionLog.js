import mongoose, { Schema } from "mongoose";
const FoodItemSchema = new Schema(
  {
    foodItem: {
      type: String,
      required: [true, "Food item name is required"],
      trim: true
    },
    quantity: {
      type: String,
      required: [true, "Quantity/portion is required (e.g. 1 bowl, 200g, 2 slices)"],
      trim: true
    },
    calories: {
      type: Number,
      required: true,
      min: [0, "Calories cannot be negative"]
    },
    protein: {
      type: Number,
      default: 0,
      min: [0, "Protein cannot be negative"]
    },
    carbs: {
      type: Number,
      default: 0,
      min: [0, "Carbs cannot be negative"]
    },
    fat: {
      type: Number,
      default: 0,
      min: [0, "Fat cannot be negative"]
    },
    notes: {
      type: String,
      trim: true
    }
  },
  { _id: true }
);
const NutritionLogSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      index: true
    },
    date: {
      type: Date,
      required: [true, "Log date is required"],
      default: Date.now,
      index: true
    },
    mealType: {
      type: String,
      enum: ["breakfast", "lunch", "dinner", "snacks"],
      required: [true, "Meal type is required"],
      index: true
    },
    items: [FoodItemSchema],
    totalCalories: {
      type: Number,
      default: 0
    },
    totalProtein: {
      type: Number,
      default: 0
    },
    totalCarbs: {
      type: Number,
      default: 0
    },
    totalFat: {
      type: Number,
      default: 0
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
NutritionLogSchema.pre("save", function() {
  if (this.items && this.items.length > 0) {
    this.totalCalories = Math.round(this.items.reduce((sum, item) => sum + (item.calories || 0), 0));
    this.totalProtein = Math.round(this.items.reduce((sum, item) => sum + (item.protein || 0), 0) * 10) / 10;
    this.totalCarbs = Math.round(this.items.reduce((sum, item) => sum + (item.carbs || 0), 0) * 10) / 10;
    this.totalFat = Math.round(this.items.reduce((sum, item) => sum + (item.fat || 0), 0) * 10) / 10;
  } else {
    this.totalCalories = 0;
    this.totalProtein = 0;
    this.totalCarbs = 0;
    this.totalFat = 0;
  }
});
NutritionLogSchema.index({ user: 1, date: -1 });
NutritionLogSchema.index({ user: 1, mealType: 1 });
const NutritionLog = mongoose.model("NutritionLog", NutritionLogSchema);
export {
  NutritionLog
};
