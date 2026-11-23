import { Notification } from '../models/Notification.js';
import { AppError } from '../middleware/error.js';
const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { page = 1, limit = 20, unreadOnly = "false" } = req.query;
    const query = { user: userId };
    if (unreadOnly === "true") {
      query.isRead = false;
    }
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;
    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      Notification.countDocuments(query),
      Notification.countDocuments({ user: userId, isRead: false })
    ]);
    res.status(200).json({
      success: true,
      notifications,
      unreadCount,
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
const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOneAndUpdate(
      { _id: id, user: req.user?.id },
      { isRead: true },
      { new: true }
    );
    if (!notification) {
      throw new AppError("Notification not found.", 404);
    }
    res.status(200).json({
      success: true,
      notification
    });
  } catch (error) {
    next(error);
  }
};
const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    await Notification.updateMany({ user: userId, isRead: false }, { isRead: true });
    res.status(200).json({
      success: true,
      message: "All notifications marked as read."
    });
  } catch (error) {
    next(error);
  }
};
const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOneAndDelete({
      _id: id,
      user: req.user?.id
    });
    if (!notification) {
      throw new AppError("Notification not found.", 404);
    }
    res.status(200).json({
      success: true,
      message: "Notification removed."
    });
  } catch (error) {
    next(error);
  }
};
export {
  deleteNotification,
  getNotifications,
  markAllAsRead,
  markAsRead
};
