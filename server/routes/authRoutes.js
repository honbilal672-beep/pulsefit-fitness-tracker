import { Router } from "express";
import { body } from "express-validator";
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  uploadAvatarHandler
} from '../controllers/authController.js';
import { verifyToken } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { uploadAvatar } from '../middleware/upload.js';
const router = Router();
router.post(
  "/register",
  authLimiter,
  [
    body("username").trim().isLength({ min: 3, max: 30 }).withMessage("Username must be between 3 and 30 characters").matches(/^[a-zA-Z0-9_.-]+$/).withMessage("Username may only contain letters, numbers, underscores, dots, and hyphens"),
    body("email").trim().isEmail().withMessage("Please provide a valid email address").normalizeEmail(),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
    body("name").trim().notEmpty().withMessage("Full name is required").isLength({ max: 60 }).withMessage("Name cannot exceed 60 characters"),
    body("consentAccepted").custom((value) => value === true || value === "true").withMessage("You must accept the terms and GDPR privacy consent to register"),
    validateRequest
  ],
  register
);
router.post(
  "/login",
  authLimiter,
  [
    body("identifier").trim().notEmpty().withMessage("Email or username is required"),
    body("password").notEmpty().withMessage("Password is required"),
    validateRequest
  ],
  login
);
router.get("/me", verifyToken, getMe);
router.put(
  "/profile",
  verifyToken,
  [
    body("name").optional().trim().notEmpty().withMessage("Name cannot be empty"),
    body("age").optional().isNumeric().withMessage("Age must be a number"),
    body("height").optional().isNumeric().withMessage("Height must be a number"),
    body("weight").optional().isNumeric().withMessage("Weight must be a number"),
    validateRequest
  ],
  updateProfile
);
router.put(
  "/change-password",
  verifyToken,
  [
    body("currentPassword").notEmpty().withMessage("Current password is required"),
    body("newPassword").isLength({ min: 6 }).withMessage("New password must be at least 6 characters long"),
    validateRequest
  ],
  changePassword
);
router.post(
  "/upload-avatar",
  verifyToken,
  uploadAvatar.single("avatar"),
  uploadAvatarHandler
);
var stdin_default = router;
export {
  stdin_default as default
};
