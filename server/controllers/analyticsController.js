import { Workout } from '../models/Workout.js';
import { NutritionLog } from '../models/NutritionLog.js';
import { ProgressEntry } from '../models/ProgressEntry.js';
const getStartDateFromRange = (range = "30d") => {
  const now = /* @__PURE__ */ new Date();
  const date = new Date(now);
  if (range === "7d") date.setDate(now.getDate() - 7);
  else if (range === "90d") date.setDate(now.getDate() - 90);
  else if (range === "1y") date.setFullYear(now.getFullYear() - 1);
  else date.setDate(now.getDate() - 30);
  return date;
};
const getWorkoutAnalytics = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { range = "30d", startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : getStartDateFromRange(range);
    const end = endDate ? new Date(endDate) : /* @__PURE__ */ new Date();
    const workouts = await Workout.find({
      user: userId,
      createdAt: { $gte: start, $lte: end }
    }).lean();
    const categoryCounts = {};
    workouts.forEach((w) => {
      categoryCounts[w.category] = (categoryCounts[w.category] || 0) + 1;
    });
    const categoryDistribution = Object.keys(categoryCounts).map((key) => ({
      name: key.toUpperCase(),
      count: categoryCounts[key]
    }));
    const dateCountMap = {};
    workouts.forEach((w) => {
      const dayKey = (w.completedAt || w.createdAt).toISOString().split("T")[0];
      if (!dateCountMap[dayKey]) {
        dateCountMap[dayKey] = { count: 0, minutes: 0, calories: 0 };
      }
      dateCountMap[dayKey].count += 1;
      dateCountMap[dayKey].minutes += w.durationMinutes || 0;
      dateCountMap[dayKey].calories += w.caloriesBurned || 0;
    });
    const frequencyTrend = Object.keys(dateCountMap).sort().map((date) => ({
      date,
      workouts: dateCountMap[date].count,
      durationMinutes: dateCountMap[date].minutes,
      caloriesBurned: dateCountMap[date].calories
    }));
    const progressEntries = await ProgressEntry.find({
      user: userId,
      date: { $gte: start, $lte: end }
    }).sort({ date: 1 }).lean();
    const strengthProgress = progressEntries.filter((p) => p.performanceMetrics && (p.performanceMetrics.maxBench || p.performanceMetrics.maxSquat || p.performanceMetrics.maxDeadlift)).map((p) => ({
      date: p.date.toISOString().split("T")[0],
      bench: p.performanceMetrics?.maxBench || 0,
      squat: p.performanceMetrics?.maxSquat || 0,
      deadlift: p.performanceMetrics?.maxDeadlift || 0,
      runTime: p.performanceMetrics?.runTimeMinutes || 0
    }));
    res.status(200).json({
      success: true,
      timeRange: { start, end, range },
      totalWorkouts: workouts.length,
      categoryDistribution,
      frequencyTrend,
      strengthProgress
    });
  } catch (error) {
    next(error);
  }
};
const getNutritionAnalytics = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { range = "30d", startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : getStartDateFromRange(range);
    const end = endDate ? new Date(endDate) : /* @__PURE__ */ new Date();
    const logs = await NutritionLog.find({
      user: userId,
      date: { $gte: start, $lte: end }
    }).sort({ date: 1 }).lean();
    const dailyMap = {};
    let totalAllProtein = 0;
    let totalAllCarbs = 0;
    let totalAllFat = 0;
    logs.forEach((log) => {
      const dateKey = log.date.toISOString().split("T")[0];
      if (!dailyMap[dateKey]) {
        dailyMap[dateKey] = { calories: 0, protein: 0, carbs: 0, fat: 0, count: 0 };
      }
      dailyMap[dateKey].calories += log.totalCalories || 0;
      dailyMap[dateKey].protein += log.totalProtein || 0;
      dailyMap[dateKey].carbs += log.totalCarbs || 0;
      dailyMap[dateKey].fat += log.totalFat || 0;
      dailyMap[dateKey].count += 1;
      totalAllProtein += log.totalProtein || 0;
      totalAllCarbs += log.totalCarbs || 0;
      totalAllFat += log.totalFat || 0;
    });
    const dailyTrend = Object.keys(dailyMap).sort().map((date) => ({
      date,
      calories: Math.round(dailyMap[date].calories),
      protein: Math.round(dailyMap[date].protein * 10) / 10,
      carbs: Math.round(dailyMap[date].carbs * 10) / 10,
      fat: Math.round(dailyMap[date].fat * 10) / 10
    }));
    const totalMacrosGrams = totalAllProtein + totalAllCarbs + totalAllFat;
    const macroDistribution = totalMacrosGrams > 0 ? [
      { name: "Protein", grams: Math.round(totalAllProtein), percentage: Math.round(totalAllProtein / totalMacrosGrams * 100), color: "#3b82f6" },
      { name: "Carbs", grams: Math.round(totalAllCarbs), percentage: Math.round(totalAllCarbs / totalMacrosGrams * 100), color: "#10b981" },
      { name: "Fat", grams: Math.round(totalAllFat), percentage: Math.round(totalAllFat / totalMacrosGrams * 100), color: "#f59e0b" }
    ] : [];
    const totalDays = dailyTrend.length || 1;
    const averageDailyCalories = Math.round(
      dailyTrend.reduce((sum, d) => sum + d.calories, 0) / totalDays
    );
    res.status(200).json({
      success: true,
      timeRange: { start, end, range },
      totalLogs: logs.length,
      averageDailyCalories,
      macroDistribution,
      dailyTrend
    });
  } catch (error) {
    next(error);
  }
};
export {
  getNutritionAnalytics,
  getWorkoutAnalytics
};
