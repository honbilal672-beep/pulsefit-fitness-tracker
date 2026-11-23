import { Router } from "express";
import { getWorkoutAnalytics, getNutritionAnalytics } from '../controllers/analyticsController.js';
import { verifyToken } from '../middleware/auth.js';
const router = Router();
router.use(verifyToken);
router.get("/workouts", getWorkoutAnalytics);
router.get("/nutrition", getNutritionAnalytics);
var stdin_default = router;
export {
  stdin_default as default
};
