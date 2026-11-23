import { Workout } from '../models/Workout.js';
import { NutritionLog } from '../models/NutritionLog.js';
import { ProgressEntry } from '../models/ProgressEntry.js';
import { Notification } from '../models/Notification.js';
import { Reminder } from '../models/Reminder.js';
import { User } from '../models/User.js';
const getDashboardOverview = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const now = /* @__PURE__ */ new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);
    const [
      user,
      recentWorkouts,
      completedThisWeekCount,
      todayNutritionLogs,
      progressHistory,
      unreadNotificationsCount,
      activeReminders
    ] = await Promise.all([
      User.findById(userId).select("-password").lean(),
      Workout.find({ user: userId }).sort({ completedAt: -1, createdAt: -1 }).limit(5).lean(),
      Workout.countDocuments({
        user: userId,
        isCompleted: true,
        completedAt: { $gte: sevenDaysAgo }
      }),
      NutritionLog.find({
        user: userId,
        date: { $gte: startOfToday, $lte: endOfToday }
      }).lean(),
      ProgressEntry.find({ user: userId }).sort({ date: -1 }).limit(2).lean(),
      Notification.countDocuments({ user: userId, isRead: false }),
      Reminder.find({ user: userId, isActive: true }).lean()
    ]);
    let todayCalories = 0;
    let todayProtein = 0;
    let todayCarbs = 0;
    let todayFat = 0;
    const mealsSummary = {
      breakfast: 0,
      lunch: 0,
      dinner: 0,
      snacks: 0
    };
    todayNutritionLogs.forEach((log) => {
      todayCalories += log.totalCalories || 0;
      todayProtein += log.totalProtein || 0;
      todayCarbs += log.totalCarbs || 0;
      todayFat += log.totalFat || 0;
      if (log.mealType in mealsSummary) {
        mealsSummary[log.mealType] += log.totalCalories || 0;
      }
    });
    const latestProgress = progressHistory[0] || null;
    const previousProgress = progressHistory[1] || null;
    let weightDelta = 0;
    if (latestProgress && previousProgress) {
      weightDelta = Math.round((latestProgress.weight - previousProgress.weight) * 10) / 10;
    }
    let targetCalories = 2200;
    if (user?.fitnessGoal === "weight_loss") targetCalories = 1800;
    else if (user?.fitnessGoal === "muscle_gain") targetCalories = 2600;
    else if (user?.fitnessGoal === "endurance") targetCalories = 2400;
    res.status(200).json({
      success: true,
      user,
      recentWorkouts,
      weeklyStats: {
        completedWorkoutsThisWeek: completedThisWeekCount,
        weeklyGoal: 4,
        completionPercentage: Math.min(100, Math.round(completedThisWeekCount / 4 * 100))
      },
      todayNutrition: {
        totalCalories: Math.round(todayCalories),
        totalProtein: Math.round(todayProtein * 10) / 10,
        totalCarbs: Math.round(todayCarbs * 10) / 10,
        totalFat: Math.round(todayFat * 10) / 10,
        targetCalories,
        caloriePercentage: Math.min(100, Math.round(todayCalories / targetCalories * 100)),
        meals: mealsSummary
      },
      progressSnapshot: {
        latest: latestProgress,
        previous: previousProgress,
        weightDelta,
        currentWeight: latestProgress?.weight || user?.weight || 70
      },
      unreadNotificationsCount,
      activeRemindersCount: activeReminders.length,
      upcomingReminders: activeReminders.slice(0, 3)
    });
  } catch (error) {
    next(error);
  }
};
export {
  getDashboardOverview
};
