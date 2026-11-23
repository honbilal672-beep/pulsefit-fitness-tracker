import { NutritionLog } from '../models/NutritionLog.js';
import { AppError } from '../middleware/error.js';
const getNutritionLogs = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { date, startDate, endDate, mealType, page = 1, limit = 20 } = req.query;
    const query = { user: userId };
    if (date) {
      const selected = new Date(date);
      const startOfDay = new Date(selected.setHours(0, 0, 0, 0));
      const endOfDay = new Date(selected.setHours(23, 59, 59, 999));
      query.date = { $gte: startOfDay, $lte: endOfDay };
    } else if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(new Date(startDate).setHours(0, 0, 0, 0));
      if (endDate) query.date.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));
    }
    if (mealType) {
      query.mealType = mealType;
    }
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;
    const [logs, total] = await Promise.all([
      NutritionLog.find(query).sort({ date: -1, createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      NutritionLog.countDocuments(query)
    ]);
    res.status(200).json({
      success: true,
      logs,
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
const getDailySummary = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const dateQuery = req.query.date ? new Date(req.query.date) : /* @__PURE__ */ new Date();
    const startOfDay = new Date(dateQuery);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(dateQuery);
    endOfDay.setHours(23, 59, 59, 999);
    const logs = await NutritionLog.find({
      user: userId,
      date: { $gte: startOfDay, $lte: endOfDay }
    }).lean();
    const summary = {
      date: startOfDay.toISOString().split("T")[0],
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      meals: {
        breakfast: { calories: 0, protein: 0, carbs: 0, fat: 0, items: [] },
        lunch: { calories: 0, protein: 0, carbs: 0, fat: 0, items: [] },
        dinner: { calories: 0, protein: 0, carbs: 0, fat: 0, items: [] },
        snacks: { calories: 0, protein: 0, carbs: 0, fat: 0, items: [] }
      }
    };
    logs.forEach((log) => {
      summary.totalCalories += log.totalCalories || 0;
      summary.totalProtein += log.totalProtein || 0;
      summary.totalCarbs += log.totalCarbs || 0;
      summary.totalFat += log.totalFat || 0;
      const mealKey = log.mealType;
      if (summary.meals[mealKey]) {
        summary.meals[mealKey].calories += log.totalCalories || 0;
        summary.meals[mealKey].protein += log.totalProtein || 0;
        summary.meals[mealKey].carbs += log.totalCarbs || 0;
        summary.meals[mealKey].fat += log.totalFat || 0;
        summary.meals[mealKey].items.push(...log.items);
      }
    });
    summary.totalProtein = Math.round(summary.totalProtein * 10) / 10;
    summary.totalCarbs = Math.round(summary.totalCarbs * 10) / 10;
    summary.totalFat = Math.round(summary.totalFat * 10) / 10;
    res.status(200).json({
      success: true,
      summary
    });
  } catch (error) {
    next(error);
  }
};
const getNutritionLogById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const log = await NutritionLog.findById(id);
    if (!log) {
      throw new AppError("Nutrition log not found.", 404);
    }
    if (log.user.toString() !== req.user?.id && req.user?.role !== "admin") {
      throw new AppError("Access denied.", 403);
    }
    res.status(200).json({
      success: true,
      log
    });
  } catch (error) {
    next(error);
  }
};
const createNutritionLog = async (req, res, next) => {
  try {
    const { date, mealType, items, notes } = req.body;
    const log = new NutritionLog({
      user: req.user?.id,
      date: date ? new Date(date) : /* @__PURE__ */ new Date(),
      mealType,
      items: Array.isArray(items) ? items : [],
      notes
    });
    await log.save();
    res.status(201).json({
      success: true,
      message: "Meal intake logged successfully.",
      log
    });
  } catch (error) {
    next(error);
  }
};
const updateNutritionLog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const log = await NutritionLog.findById(id);
    if (!log) {
      throw new AppError("Nutrition log not found.", 404);
    }
    if (log.user.toString() !== req.user?.id) {
      throw new AppError("Access denied.", 403);
    }
    const { date, mealType, items, notes } = req.body;
    if (date) log.date = new Date(date);
    if (mealType) log.mealType = mealType;
    if (items) log.items = items;
    if (notes !== void 0) log.notes = notes;
    await log.save();
    res.status(200).json({
      success: true,
      message: "Meal log updated successfully.",
      log
    });
  } catch (error) {
    next(error);
  }
};
const deleteNutritionLog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const log = await NutritionLog.findById(id);
    if (!log) {
      throw new AppError("Nutrition log not found.", 404);
    }
    if (log.user.toString() !== req.user?.id && req.user?.role !== "admin") {
      throw new AppError("Access denied.", 403);
    }
    await NutritionLog.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: "Nutrition log deleted successfully."
    });
  } catch (error) {
    next(error);
  }
};
export {
  createNutritionLog,
  deleteNutritionLog,
  getDailySummary,
  getNutritionLogById,
  getNutritionLogs,
  updateNutritionLog
};
