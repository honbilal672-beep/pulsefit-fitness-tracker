import { Parser } from "json2csv";
import PDFDocument from "pdfkit";
import { Workout } from '../models/Workout.js';
import { NutritionLog } from '../models/NutritionLog.js';
import { ProgressEntry } from '../models/ProgressEntry.js';
import { User } from '../models/User.js';
import { AppError } from '../middleware/error.js';
const exportCSV = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { type = "workouts", startDate, endDate } = req.query;
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);
    let dataToExport = [];
    let fields = [];
    let filename = `pulsefit-${type}-${Date.now()}.csv`;
    if (type === "workouts") {
      const query = { user: userId };
      if (startDate || endDate) query.completedAt = dateFilter;
      const workouts = await Workout.find(query).lean();
      fields = ["title", "category", "durationMinutes", "caloriesBurned", "isCompleted", "completedAt", "exercisesCount"];
      dataToExport = workouts.map((w) => ({
        title: w.title,
        category: w.category,
        durationMinutes: w.durationMinutes,
        caloriesBurned: w.caloriesBurned || 0,
        isCompleted: w.isCompleted ? "Yes" : "No",
        completedAt: w.completedAt ? new Date(w.completedAt).toISOString().split("T")[0] : "N/A",
        exercisesCount: w.exercises?.length || 0
      }));
    } else if (type === "nutrition") {
      const query = { user: userId };
      if (startDate || endDate) query.date = dateFilter;
      const logs = await NutritionLog.find(query).lean();
      fields = ["date", "mealType", "totalCalories", "totalProtein", "totalCarbs", "totalFat", "itemsSummary"];
      dataToExport = logs.map((log) => ({
        date: new Date(log.date).toISOString().split("T")[0],
        mealType: log.mealType,
        totalCalories: log.totalCalories,
        totalProtein: log.totalProtein,
        totalCarbs: log.totalCarbs,
        totalFat: log.totalFat,
        itemsSummary: log.items?.map((i) => `${i.foodItem} (${i.quantity})`).join(", ") || ""
      }));
    } else if (type === "progress") {
      const query = { user: userId };
      if (startDate || endDate) query.date = dateFilter;
      const progress = await ProgressEntry.find(query).lean();
      fields = ["date", "weight", "bodyFatPercentage", "chest", "waist", "hips", "maxBench", "maxSquat", "maxDeadlift"];
      dataToExport = progress.map((p) => ({
        date: new Date(p.date).toISOString().split("T")[0],
        weight: p.weight,
        bodyFatPercentage: p.bodyFatPercentage || "N/A",
        chest: p.measurements?.chest || "N/A",
        waist: p.measurements?.waist || "N/A",
        hips: p.measurements?.hips || "N/A",
        maxBench: p.performanceMetrics?.maxBench || "N/A",
        maxSquat: p.performanceMetrics?.maxSquat || "N/A",
        maxDeadlift: p.performanceMetrics?.maxDeadlift || "N/A"
      }));
    } else {
      throw new AppError("Invalid report type. Supported types: workouts, nutrition, progress.", 400);
    }
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(dataToExport);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};
const exportPDF = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1e3);
    const end = endDate ? new Date(endDate) : /* @__PURE__ */ new Date();
    const [user, workouts, nutritionLogs, progressEntries] = await Promise.all([
      User.findById(userId).lean(),
      Workout.find({ user: userId, createdAt: { $gte: start, $lte: end } }).lean(),
      NutritionLog.find({ user: userId, date: { $gte: start, $lte: end } }).lean(),
      ProgressEntry.find({ user: userId, date: { $gte: start, $lte: end } }).lean()
    ]);
    if (!user) {
      throw new AppError("User not found.", 404);
    }
    const doc = new PDFDocument({ margin: 40 });
    const filename = `pulsefit-report-${user.username}-${Date.now()}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    doc.pipe(res);
    doc.fillColor("#3b82f6").fontSize(24).text("PULSEFIT FITNESS REPORT", { align: "center" });
    doc.moveDown(0.5);
    doc.fillColor("#6b7280").fontSize(11).text(
      `Period: ${start.toISOString().split("T")[0]} to ${end.toISOString().split("T")[0]} | Generated on: ${(/* @__PURE__ */ new Date()).toLocaleDateString()}`,
      { align: "center" }
    );
    doc.moveDown(1.5);
    doc.fillColor("#111827").fontSize(14).text("1. ATHLETE PROFILE");
    doc.moveDown(0.3);
    doc.fontSize(10).fillColor("#374151");
    doc.text(`Name: ${user.name} (@${user.username})`);
    doc.text(`Fitness Goal: ${user.fitnessGoal?.toUpperCase() || "GENERAL HEALTH"}`);
    doc.text(`Height: ${user.height || 175} cm | Baseline Weight: ${user.weight || 70} kg`);
    doc.moveDown(1.2);
    const totalWorkouts = workouts.length;
    const completedWorkouts = workouts.filter((w) => w.isCompleted).length;
    const totalMinutes = workouts.reduce((sum, w) => sum + (w.durationMinutes || 0), 0);
    const totalCaloriesBurned = workouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);
    doc.fillColor("#111827").fontSize(14).text("2. WORKOUT ACTIVITY SUMMARY");
    doc.moveDown(0.3);
    doc.fontSize(10).fillColor("#374151");
    doc.text(`Total Routines: ${totalWorkouts} | Completed Workouts: ${completedWorkouts}`);
    doc.text(`Total Training Time: ${totalMinutes} minutes`);
    doc.text(`Estimated Energy Expended: ${totalCaloriesBurned} kcal`);
    if (workouts.length > 0) {
      doc.moveDown(0.5);
      doc.fontSize(10).fillColor("#1f2937").text("Recent Workouts:");
      workouts.slice(0, 5).forEach((w, index) => {
        doc.fillColor("#4b5563").text(
          `  \u2022 ${w.title} (${w.category.toUpperCase()}) - ${w.durationMinutes} mins - ${w.isCompleted ? "Completed" : "Planned"}`
        );
      });
    }
    doc.moveDown(1.2);
    const totalNutritionLogs = nutritionLogs.length;
    const avgCalories = totalNutritionLogs > 0 ? Math.round(nutritionLogs.reduce((sum, n) => sum + (n.totalCalories || 0), 0) / totalNutritionLogs) : 0;
    doc.fillColor("#111827").fontSize(14).text("3. NUTRITION & DIET SNAPSHOT");
    doc.moveDown(0.3);
    doc.fontSize(10).fillColor("#374151");
    doc.text(`Total Meals Logged: ${totalNutritionLogs}`);
    doc.text(`Average Logged Calories per meal: ${avgCalories} kcal`);
    doc.moveDown(1.2);
    doc.fillColor("#111827").fontSize(14).text("4. BODY MEASUREMENTS & PERFORMANCE");
    doc.moveDown(0.3);
    doc.fontSize(10).fillColor("#374151");
    if (progressEntries.length > 0) {
      const firstEntry = progressEntries[progressEntries.length - 1];
      const latestEntry = progressEntries[0];
      const weightDiff = (latestEntry.weight - firstEntry.weight).toFixed(1);
      doc.text(`Start Weight: ${firstEntry.weight} kg -> Latest Weight: ${latestEntry.weight} kg (${weightDiff} kg change)`);
      if (latestEntry.performanceMetrics?.maxBench || latestEntry.performanceMetrics?.maxSquat) {
        doc.text(
          `Personal Records - Bench: ${latestEntry.performanceMetrics.maxBench || 0} kg | Squat: ${latestEntry.performanceMetrics.maxSquat || 0} kg | Deadlift: ${latestEntry.performanceMetrics.maxDeadlift || 0} kg`
        );
      }
    } else {
      doc.text("No progress entries recorded in this time range.");
    }
    doc.moveDown(2);
    doc.fillColor("#9ca3af").fontSize(9).text("Generated by PulseFit — Personal Fitness & Nutrition Tracker", { align: "center" });
    doc.end();
  } catch (error) {
    next(error);
  }
};
export {
  exportCSV,
  exportPDF
};
