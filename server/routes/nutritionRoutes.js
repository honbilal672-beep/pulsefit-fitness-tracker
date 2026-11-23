import { Router } from "express";
import { body, param } from "express-validator";
import {
  getNutritionLogs,
  getDailySummary,
  getNutritionLogById,
  createNutritionLog,
  updateNutritionLog,
  deleteNutritionLog
} from '../controllers/nutritionController.js';
import { verifyToken } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
const router = Router();
router.use(verifyToken);
router.get("/", getNutritionLogs);
router.get("/daily-summary", getDailySummary);
router.get(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid nutrition log ID"), validateRequest],
  getNutritionLogById
);
router.post(
  "/",
  [
    body("mealType").isIn(["breakfast", "lunch", "dinner", "snacks"]).withMessage("Meal type must be breakfast, lunch, dinner, or snacks"),
    body("items").isArray({ min: 1 }).withMessage("At least one food item must be included"),
    body("items.*.foodItem").trim().notEmpty().withMessage("Food item name is required"),
    body("items.*.quantity").trim().notEmpty().withMessage("Quantity is required"),
    body("items.*.calories").isNumeric().withMessage("Calories must be numeric"),
    validateRequest
  ],
  createNutritionLog
);
router.put(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid nutrition log ID"), validateRequest],
  updateNutritionLog
);
router.delete(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid nutrition log ID"), validateRequest],
  deleteNutritionLog
);
var stdin_default = router;
export {
  stdin_default as default
};
