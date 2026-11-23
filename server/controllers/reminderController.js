import { Reminder } from '../models/Reminder.js';
import { AppError } from '../middleware/error.js';
const getReminders = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const reminders = await Reminder.find({ user: userId }).sort({ scheduleTime: 1 }).lean();
    res.status(200).json({
      success: true,
      reminders
    });
  } catch (error) {
    next(error);
  }
};
const createReminder = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { title, reminderType, scheduleTime, daysOfWeek, notes } = req.body;
    const reminder = new Reminder({
      user: userId,
      title,
      reminderType: reminderType || "workout",
      scheduleTime,
      daysOfWeek: Array.isArray(daysOfWeek) ? daysOfWeek : [1, 2, 3, 4, 5],
      notes,
      isActive: true
    });
    await reminder.save();
    res.status(201).json({
      success: true,
      message: "Reminder scheduled successfully.",
      reminder
    });
  } catch (error) {
    next(error);
  }
};
const updateReminder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const reminder = await Reminder.findById(id);
    if (!reminder) {
      throw new AppError("Reminder not found.", 404);
    }
    if (reminder.user.toString() !== req.user?.id) {
      throw new AppError("Access denied.", 403);
    }
    const { title, reminderType, scheduleTime, daysOfWeek, notes, isActive } = req.body;
    if (title) reminder.title = title;
    if (reminderType) reminder.reminderType = reminderType;
    if (scheduleTime) reminder.scheduleTime = scheduleTime;
    if (daysOfWeek) reminder.daysOfWeek = daysOfWeek;
    if (notes !== void 0) reminder.notes = notes;
    if (isActive !== void 0) reminder.isActive = isActive;
    await reminder.save();
    res.status(200).json({
      success: true,
      message: "Reminder updated successfully.",
      reminder
    });
  } catch (error) {
    next(error);
  }
};
const toggleReminderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const reminder = await Reminder.findById(id);
    if (!reminder) {
      throw new AppError("Reminder not found.", 404);
    }
    if (reminder.user.toString() !== req.user?.id) {
      throw new AppError("Access denied.", 403);
    }
    reminder.isActive = !reminder.isActive;
    await reminder.save();
    res.status(200).json({
      success: true,
      message: `Reminder ${reminder.isActive ? "activated" : "deactivated"}.`,
      reminder
    });
  } catch (error) {
    next(error);
  }
};
const deleteReminder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const reminder = await Reminder.findById(id);
    if (!reminder) {
      throw new AppError("Reminder not found.", 404);
    }
    if (reminder.user.toString() !== req.user?.id) {
      throw new AppError("Access denied.", 403);
    }
    await Reminder.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: "Reminder deleted successfully."
    });
  } catch (error) {
    next(error);
  }
};
export {
  createReminder,
  deleteReminder,
  getReminders,
  toggleReminderStatus,
  updateReminder
};
