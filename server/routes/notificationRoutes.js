import { Router } from "express";
import { param } from "express-validator";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
} from '../controllers/notificationController.js';
import { verifyToken } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
const router = Router();
router.use(verifyToken);
router.get("/", getNotifications);
router.patch("/mark-all-read", markAllAsRead);
router.patch(
  "/:id/read",
  [param("id").isMongoId().withMessage("Invalid notification ID"), validateRequest],
  markAsRead
);
router.delete(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid notification ID"), validateRequest],
  deleteNotification
);
var stdin_default = router;
export {
  stdin_default as default
};
