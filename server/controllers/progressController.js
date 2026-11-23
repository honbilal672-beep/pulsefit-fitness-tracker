import { ProgressEntry } from '../models/ProgressEntry.js';
import { User } from '../models/User.js';
import { Notification } from '../models/Notification.js';
import { AppError } from '../middleware/error.js';
const getProgressEntries = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { startDate, endDate, page = 1, limit = 30 } = req.query;
    const query = { user: userId };
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;
    const [entries, total] = await Promise.all([
      ProgressEntry.find(query).sort({ date: -1 }).skip(skip).limit(limitNum).lean(),
      ProgressEntry.countDocuments(query)
    ]);
    res.status(200).json({
      success: true,
      entries,
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
const getLatestProgress = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const lastTwoEntries = await ProgressEntry.find({ user: userId }).sort({ date: -1 }).limit(2).lean();
    const latest = lastTwoEntries[0] || null;
    const previous = lastTwoEntries[1] || null;
    let weightChange = 0;
    if (latest && previous) {
      weightChange = Math.round((latest.weight - previous.weight) * 10) / 10;
    }
    res.status(200).json({
      success: true,
      latest,
      previous,
      weightChange
    });
  } catch (error) {
    next(error);
  }
};
const createProgressEntry = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { date, weight, bodyFatPercentage, measurements, performanceMetrics, notes, photoUrl } = req.body;
    const entry = new ProgressEntry({
      user: userId,
      date: date ? new Date(date) : /* @__PURE__ */ new Date(),
      weight: Number(weight),
      bodyFatPercentage: bodyFatPercentage ? Number(bodyFatPercentage) : void 0,
      measurements: measurements || {},
      performanceMetrics: performanceMetrics || {},
      notes,
      photoUrl
    });
    await entry.save();
    const user = await User.findById(userId);
    if (user) {
      const oldWeight = user.weight || entry.weight;
      user.weight = entry.weight;
      await user.save();
      if (user.fitnessGoal === "weight_loss" && entry.weight < oldWeight) {
        await Notification.create({
          user: userId,
          title: "Weight Goal Progress! \u{1F3AF}",
          message: `Down to ${entry.weight} kg! You lost ${(oldWeight - entry.weight).toFixed(1)} kg since your last record.`,
          type: "goal",
          link: "/progress"
        });
      } else if (user.fitnessGoal === "muscle_gain" && entry.weight > oldWeight) {
        await Notification.create({
          user: userId,
          title: "Muscle Gain Milestone! \u{1F4AA}",
          message: `Weight up to ${entry.weight} kg! Great progress building lean mass.`,
          type: "goal",
          link: "/progress"
        });
      }
    }
    res.status(201).json({
      success: true,
      message: "Progress recorded successfully.",
      entry
    });
  } catch (error) {
    next(error);
  }
};
const updateProgressEntry = async (req, res, next) => {
  try {
    const { id } = req.params;
    const entry = await ProgressEntry.findById(id);
    if (!entry) {
      throw new AppError("Progress entry not found.", 404);
    }
    if (entry.user.toString() !== req.user?.id) {
      throw new AppError("Access denied.", 403);
    }
    const { date, weight, bodyFatPercentage, measurements, performanceMetrics, notes, photoUrl } = req.body;
    if (date) entry.date = new Date(date);
    if (weight !== void 0) entry.weight = Number(weight);
    if (bodyFatPercentage !== void 0) entry.bodyFatPercentage = Number(bodyFatPercentage);
    if (measurements) entry.measurements = { ...entry.measurements, ...measurements };
    if (performanceMetrics) entry.performanceMetrics = { ...entry.performanceMetrics, ...performanceMetrics };
    if (notes !== void 0) entry.notes = notes;
    if (photoUrl !== void 0) entry.photoUrl = photoUrl;
    await entry.save();
    res.status(200).json({
      success: true,
      message: "Progress entry updated successfully.",
      entry
    });
  } catch (error) {
    next(error);
  }
};
const deleteProgressEntry = async (req, res, next) => {
  try {
    const { id } = req.params;
    const entry = await ProgressEntry.findById(id);
    if (!entry) {
      throw new AppError("Progress entry not found.", 404);
    }
    if (entry.user.toString() !== req.user?.id && req.user?.role !== "admin") {
      throw new AppError("Access denied.", 403);
    }
    await ProgressEntry.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: "Progress entry deleted successfully."
    });
  } catch (error) {
    next(error);
  }
};
export {
  createProgressEntry,
  deleteProgressEntry,
  getLatestProgress,
  getProgressEntries,
  updateProgressEntry
};
