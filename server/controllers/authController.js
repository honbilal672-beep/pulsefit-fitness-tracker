import { User } from '../models/User.js';
import { generateToken } from '../middleware/auth.js';
import { AppError } from '../middleware/error.js';
const register = async (req, res, next) => {
  try {
    const { username, email, password, name, age, gender, height, weight, fitnessGoal, consentAccepted } = req.body;
    if (!consentAccepted) {
      throw new AppError("You must agree to the Privacy Policy and Data Consent terms to register.", 400);
    }
    const existingEmail = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingEmail) {
      throw new AppError("Email is already registered. Please log in or use a different email.", 409);
    }
    const existingUsername = await User.findOne({ username: username.toLowerCase().trim() });
    if (existingUsername) {
      throw new AppError("Username is already taken. Please choose another username.", 409);
    }
    const defaultAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || username)}`;
    const newUser = new User({
      username: username.toLowerCase().trim(),
      email: email.toLowerCase().trim(),
      password,
      name: name.trim(),
      profilePicture: defaultAvatar,
      age: age ? Number(age) : 25,
      gender: gender || "prefer_not_to_say",
      height: height ? Number(height) : 175,
      weight: weight ? Number(weight) : 70,
      fitnessGoal: fitnessGoal || "general_health",
      isProfilePublic: false,
      consentAcceptedAt: /* @__PURE__ */ new Date()
    });
    await newUser.save();
    const token = generateToken(newUser);
    res.status(201).json({
      success: true,
      message: "Registration successful! Welcome to PulseFit.",
      token,
      user: newUser.toJSON()
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      throw new AppError("Please provide both username/email and password.", 400);
    }
    const cleanIdentifier = identifier.toLowerCase().trim();
    const user = await User.findOne({
      $or: [{ email: cleanIdentifier }, { username: cleanIdentifier }]
    }).select("+password");
    if (!user) {
      throw new AppError("Invalid credentials. User not found.", 401);
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AppError("Invalid credentials. Incorrect password.", 401);
    }
    const token = generateToken(user);
    res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: user.toJSON()
    });
  } catch (error) {
    next(error);
  }
};
const getMe = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      throw new AppError("User not authenticated.", 401);
    }
    const user = await User.findById(req.user.id).populate("followers", "username name profilePicture").populate("following", "username name profilePicture");
    if (!user) {
      throw new AppError("User profile not found.", 404);
    }
    res.status(200).json({
      success: true,
      user: user.toJSON()
    });
  } catch (error) {
    next(error);
  }
};
const updateProfile = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      throw new AppError("User not authenticated.", 401);
    }
    const allowedUpdates = [
      "name",
      "age",
      "gender",
      "height",
      "weight",
      "fitnessGoal",
      "isProfilePublic",
      "settings"
    ];
    const updates = {};
    for (const key of allowedUpdates) {
      if (req.body[key] !== void 0) {
        updates[key] = req.body[key];
      }
    }
    const updatedUser = await User.findByIdAndUpdate(req.user.id, { $set: updates }, {
      new: true,
      runValidators: true
    });
    if (!updatedUser) {
      throw new AppError("User not found.", 404);
    }
    res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user: updatedUser.toJSON()
    });
  } catch (error) {
    next(error);
  }
};
const changePassword = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      throw new AppError("User not authenticated.", 401);
    }
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      throw new AppError("Please provide both current and new passwords.", 400);
    }
    if (newPassword.length < 6) {
      throw new AppError("New password must be at least 6 characters long.", 400);
    }
    const user = await User.findById(req.user.id).select("+password");
    if (!user) {
      throw new AppError("User not found.", 404);
    }
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new AppError("Current password is incorrect.", 400);
    }
    user.password = newPassword;
    await user.save();
    res.status(200).json({
      success: true,
      message: "Password changed successfully. Please use your new password next time."
    });
  } catch (error) {
    next(error);
  }
};
const uploadAvatarHandler = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      throw new AppError("User not authenticated.", 401);
    }
    if (!req.file) {
      throw new AppError("No image file uploaded.", 400);
    }
    const relativePath = `/uploads/profiles/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profilePicture: relativePath },
      { new: true }
    );
    if (!user) {
      throw new AppError("User not found.", 404);
    }
    res.status(200).json({
      success: true,
      message: "Profile picture updated successfully.",
      profilePicture: relativePath,
      user: user.toJSON()
    });
  } catch (error) {
    next(error);
  }
};
export {
  changePassword,
  getMe,
  login,
  register,
  updateProfile,
  uploadAvatarHandler
};
