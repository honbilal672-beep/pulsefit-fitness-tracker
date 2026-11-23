import { Router } from "express";
import { body, param } from "express-validator";
import {
  getWorkouts,
  getWorkoutById,
  createWorkout,
  updateWorkout,
  deleteWorkout,
  completeWorkout
} from '../controllers/workoutController.js';
import { verifyToken } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
const router = Router();
router.use(verifyToken);
router.get("/", getWorkouts);
router.get(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid workout ID format"), validateRequest],
  getWorkoutById
);
router.post(
  "/",
  [
    body("title").trim().notEmpty().withMessage("Workout routine title is required"),
    body("category").optional().isIn(["strength", "cardio", "flexibility", "hiit", "endurance", "calisthenics", "other"]).withMessage("Invalid workout category"),
    body("durationMinutes").optional().isNumeric().withMessage("Duration must be a numeric value"),
    validateRequest
  ],
  createWorkout
);
router.put(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid workout ID format"), validateRequest],
  updateWorkout
);
router.delete(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid workout ID format"), validateRequest],
  deleteWorkout
);
router.post(
  "/:id/complete",
  [
    param("id").isMongoId().withMessage("Invalid workout ID format"),
    body("durationMinutes").optional().isNumeric().withMessage("Duration must be a number"),
    validateRequest
  ],
  completeWorkout
);
var stdin_default = router;
export {
  stdin_default as default
};
