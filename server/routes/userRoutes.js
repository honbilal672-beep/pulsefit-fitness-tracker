import { Router } from "express";
import { param } from "express-validator";
import {
  searchUsers,
  getPublicProfile,
  followUser,
  unfollowUser,
  downloadUserData,
  deleteMyAccount
} from '../controllers/userController.js';
import { verifyToken, optionalAuth } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
const router = Router();
router.get("/search", optionalAuth, searchUsers);
router.get("/:username", optionalAuth, getPublicProfile);
router.post(
  "/:id/follow",
  verifyToken,
  [param("id").isMongoId().withMessage("Invalid user ID"), validateRequest],
  followUser
);
router.post(
  "/:id/unfollow",
  verifyToken,
  [param("id").isMongoId().withMessage("Invalid user ID"), validateRequest],
  unfollowUser
);
router.get("/me/export-data", verifyToken, downloadUserData);
router.delete("/me/delete-account", verifyToken, deleteMyAccount);
var stdin_default = router;
export {
  stdin_default as default
};
