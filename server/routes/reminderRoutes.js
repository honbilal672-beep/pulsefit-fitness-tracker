import { Router } from "express";
import { body, param } from "express-validator";
import {
  getReminders,
  createReminder,
  updateReminder,
  toggleReminderStatus,
  deleteReminder
} from '../controllers/reminderController.js';
import { verifyToken } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
const router = Router();
router.use(verifyToken);
router.get("/", getReminders);
router.post(
  "/",
  [
    body("title").trim().notEmpty().withMessage("Reminder title is required"),
    body("scheduleTime").matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage("Time must be in HH:mm 24h format (e.g. 08:30)"),
    validateRequest
  ],
  createReminder
);
router.put(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid reminder ID"), validateRequest],
  updateReminder
);
router.patch(
  "/:id/toggle",
  [param("id").isMongoId().withMessage("Invalid reminder ID"), validateRequest],
  toggleReminderStatus
);
router.delete(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid reminder ID"), validateRequest],
  deleteReminder
);
var stdin_default = router;
export {
  stdin_default as default
};
