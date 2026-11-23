import { User } from '../models/User.js';
import { Workout } from '../models/Workout.js';
import { NutritionLog } from '../models/NutritionLog.js';
import { ProgressEntry } from '../models/ProgressEntry.js';
import { Notification } from '../models/Notification.js';
import { Reminder } from '../models/Reminder.js';
import { SupportTicket } from '../models/SupportTicket.js';
import { AppError } from '../middleware/error.js';
const searchUsers = async (req, res, next) => {
  try {
    const { q = "", page = 1, limit = 20 } = req.query;
    const queryStr = String(q).trim();
    if (!queryStr) {
      res.status(200).json({ success: true, users: [], total: 0 });
      return;
    }
    const searchRegex = new RegExp(queryStr, "i");
    const filter = {
      $or: [{ username: searchRegex }, { name: searchRegex }],
      isProfilePublic: true
    };
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;
    const [users, total] = await Promise.all([
      User.find(filter).select("username name profilePicture fitnessGoal followers following").skip(skip).limit(limitNum).lean(),
      User.countDocuments(filter)
    ]);
    res.status(200).json({
      success: true,
      users: users.map((u) => ({
        ...u,
        followersCount: u.followers?.length || 0,
        followingCount: u.following?.length || 0,
        isFollowedByMe: req.user?.id ? u.followers?.some((f) => f.toString() === req.user?.id) : false
      })),
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
const getPublicProfile = async (req, res, next) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username: username.toLowerCase() }).select("username name profilePicture age gender height weight fitnessGoal isProfilePublic followers following createdAt").populate("followers", "username name profilePicture").populate("following", "username name profilePicture").lean();
    if (!user) {
      throw new AppError("User not found.", 404);
    }
    const isSelf = req.user?.id === user._id.toString();
    if (!user.isProfilePublic && !isSelf) {
      res.status(200).json({
        success: true,
        user: {
          username: user.username,
          name: user.name,
          profilePicture: user.profilePicture,
          isProfilePublic: false,
          followersCount: user.followers?.length || 0,
          followingCount: user.following?.length || 0
        },
        recentWorkouts: [],
        message: "This user profile is private."
      });
      return;
    }
    const recentWorkouts = await Workout.find({
      user: user._id,
      isCompleted: true
    }).sort({ completedAt: -1 }).limit(5).lean();
    const isFollowedByMe = req.user?.id ? user.followers?.some((f) => f._id?.toString() === req.user?.id || f.toString() === req.user?.id) : false;
    res.status(200).json({
      success: true,
      user: {
        ...user,
        followersCount: user.followers?.length || 0,
        followingCount: user.following?.length || 0,
        isFollowedByMe
      },
      recentWorkouts
    });
  } catch (error) {
    next(error);
  }
};
const followUser = async (req, res, next) => {
  try {
    const currentUserId = req.user?.id;
    const targetUserId = req.params.id;
    if (currentUserId === targetUserId) {
      throw new AppError("You cannot follow yourself.", 400);
    }
    const [currentUser, targetUser] = await Promise.all([
      User.findById(currentUserId),
      User.findById(targetUserId)
    ]);
    if (!targetUser || !currentUser) {
      throw new AppError("User not found.", 404);
    }
    const alreadyFollowing = currentUser.following.some((f) => f.toString() === targetUserId);
    if (alreadyFollowing) {
      res.status(200).json({ success: true, message: "You are already following this user." });
      return;
    }
    currentUser.following.push(targetUser._id);
    targetUser.followers.push(currentUser._id);
    await Promise.all([currentUser.save(), targetUser.save()]);
    await Notification.create({
      user: targetUser._id,
      title: "New Follower! \u{1F464}",
      message: `${currentUser.name} (@${currentUser.username}) started following your fitness journey.`,
      type: "follow",
      link: `/profile/${currentUser.username}`
    });
    res.status(200).json({
      success: true,
      message: `You are now following ${targetUser.name}.`
    });
  } catch (error) {
    next(error);
  }
};
const unfollowUser = async (req, res, next) => {
  try {
    const currentUserId = req.user?.id;
    const targetUserId = req.params.id;
    const [currentUser, targetUser] = await Promise.all([
      User.findById(currentUserId),
      User.findById(targetUserId)
    ]);
    if (!targetUser || !currentUser) {
      throw new AppError("User not found.", 404);
    }
    currentUser.following = currentUser.following.filter((f) => f.toString() !== targetUserId);
    targetUser.followers = targetUser.followers.filter((f) => f.toString() !== currentUserId);
    await Promise.all([currentUser.save(), targetUser.save()]);
    res.status(200).json({
      success: true,
      message: `You have unfollowed ${targetUser.name}.`
    });
  } catch (error) {
    next(error);
  }
};
const downloadUserData = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const [user, workouts, nutrition, progress, tickets] = await Promise.all([
      User.findById(userId).lean(),
      Workout.find({ user: userId }).lean(),
      NutritionLog.find({ user: userId }).lean(),
      ProgressEntry.find({ user: userId }).lean(),
      SupportTicket.find({ user: userId }).lean()
    ]);
    if (!user) {
      throw new AppError("User not found.", 404);
    }
    const gdprExport = {
      exportTimestamp: (/* @__PURE__ */ new Date()).toISOString(),
      userProfile: {
        username: user.username,
        email: user.email,
        name: user.name,
        age: user.age,
        gender: user.gender,
        height: user.height,
        weight: user.weight,
        fitnessGoal: user.fitnessGoal,
        settings: user.settings,
        consentAcceptedAt: user.consentAcceptedAt,
        createdAt: user.createdAt
      },
      workouts,
      nutrition,
      progress,
      supportTickets: tickets
    };
    res.setHeader("Content-Type", "application/json");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="pulsefit-data-${user.username}-${Date.now()}.json"`
    );
    res.status(200).send(JSON.stringify(gdprExport, null, 2));
  } catch (error) {
    next(error);
  }
};
const deleteMyAccount = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    await Promise.all([
      Workout.deleteMany({ user: userId }),
      NutritionLog.deleteMany({ user: userId }),
      ProgressEntry.deleteMany({ user: userId }),
      Notification.deleteMany({ user: userId }),
      Reminder.deleteMany({ user: userId }),
      SupportTicket.deleteMany({ user: userId }),
      User.findByIdAndDelete(userId)
    ]);
    res.status(200).json({
      success: true,
      message: "Your account and all associated personal data have been permanently deleted."
    });
  } catch (error) {
    next(error);
  }
};
export {
  deleteMyAccount,
  downloadUserData,
  followUser,
  getPublicProfile,
  searchUsers,
  unfollowUser
};
