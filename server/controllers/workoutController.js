import { Workout } from '../models/Workout.js';
import { Notification } from '../models/Notification.js';
import { AppError } from '../middleware/error.js';
const getWorkouts = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const {
      category,
      tag,
      isCompleted,
      startDate,
      endDate,
      search,
      sortBy = "createdAt",
      order = "desc",
      page = 1,
      limit = 10
    } = req.query;
    const query = { user: userId };
    if (category) {
      query.category = category;
    }
    if (tag) {
      query.tags = tag;
    }
    if (isCompleted !== void 0) {
      query.isCompleted = isCompleted === "true";
    }
    if (startDate || endDate) {
      query.completedAt = {};
      if (startDate) query.completedAt.$gte = new Date(startDate);
      if (endDate) query.completedAt.$lte = new Date(endDate);
    }
    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { "exercises.name": searchRegex },
        { tags: searchRegex }
      ];
    }
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;
    const sortOrder = order === "asc" ? 1 : -1;
    const [workouts, total] = await Promise.all([
      Workout.find(query).sort({ [sortBy]: sortOrder }).skip(skip).limit(limitNum).lean(),
      Workout.countDocuments(query)
    ]);
    res.status(200).json({
      success: true,
      workouts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
};
const getWorkoutById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const workout = await Workout.findById(id);
    if (!workout) {
      throw new AppError("Workout not found.", 404);
    }
    if (workout.user.toString() !== req.user?.id && req.user?.role !== "admin") {
      throw new AppError("Access denied: You do not have permission to view this workout.", 403);
    }
    res.status(200).json({
      success: true,
      workout
    });
  } catch (error) {
    next(error);
  }
};
const createWorkout = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      tags,
      exercises,
      durationMinutes,
      intensity,
      caloriesBurned,
      notes
    } = req.body;
    const workout = new Workout({
      user: req.user?.id,
      title,
      description,
      category: category || "strength",
      tags: Array.isArray(tags) ? tags : [],
      exercises: Array.isArray(exercises) ? exercises : [],
      durationMinutes: durationMinutes ? Number(durationMinutes) : 45,
      intensity: intensity || "medium",
      caloriesBurned: caloriesBurned ? Number(caloriesBurned) : 0,
      notes
    });
    await workout.save();
    res.status(201).json({
      success: true,
      message: "Workout routine created successfully.",
      workout
    });
  } catch (error) {
    next(error);
  }
};
const updateWorkout = async (req, res, next) => {
  try {
    const { id } = req.params;
    const workout = await Workout.findById(id);
    if (!workout) {
      throw new AppError("Workout not found.", 404);
    }
    if (workout.user.toString() !== req.user?.id) {
      throw new AppError("Access denied: You can only edit your own workouts.", 403);
    }
    const allowedFields = [
      "title",
      "description",
      "category",
      "tags",
      "exercises",
      "durationMinutes",
      "intensity",
      "caloriesBurned",
      "notes",
      "isCompleted",
      "completedAt"
    ];
    allowedFields.forEach((field) => {
      if (req.body[field] !== void 0) {
        workout[field] = req.body[field];
      }
    });
    await workout.save();
    res.status(200).json({
      success: true,
      message: "Workout routine updated successfully.",
      workout
    });
  } catch (error) {
    next(error);
  }
};
const deleteWorkout = async (req, res, next) => {
  try {
    const { id } = req.params;
    const workout = await Workout.findById(id);
    if (!workout) {
      throw new AppError("Workout not found.", 404);
    }
    if (workout.user.toString() !== req.user?.id && req.user?.role !== "admin") {
      throw new AppError("Access denied: You can only delete your own workouts.", 403);
    }
    await Workout.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: "Workout deleted successfully."
    });
  } catch (error) {
    next(error);
  }
};
const completeWorkout = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { durationMinutes, caloriesBurned, completedAt = /* @__PURE__ */ new Date(), notes } = req.body;
    const workout = await Workout.findById(id);
    if (!workout) {
      throw new AppError("Workout not found.", 404);
    }
    if (workout.user.toString() !== req.user?.id) {
      throw new AppError("Access denied.", 403);
    }
    workout.isCompleted = true;
    workout.completedAt = new Date(completedAt);
    if (durationMinutes) workout.durationMinutes = Number(durationMinutes);
    if (caloriesBurned) workout.caloriesBurned = Number(caloriesBurned);
    if (notes) workout.notes = notes;
    await workout.save();
    await Notification.create({
      user: req.user.id,
      title: "Workout Completed! \u{1F4AA}",
      message: `Great job! You finished "${workout.title}" (${workout.durationMinutes} mins, ${workout.caloriesBurned || 0} kcal).`,
      type: "workout",
      link: "/workouts",
      metadata: { workoutId: workout._id }
    });
    res.status(200).json({
      success: true,
      message: "Workout completed! Progress recorded.",
      workout
    });
  } catch (error) {
    next(error);
  }
};
export {
  completeWorkout,
  createWorkout,
  deleteWorkout,
  getWorkoutById,
  getWorkouts,
  updateWorkout
};
