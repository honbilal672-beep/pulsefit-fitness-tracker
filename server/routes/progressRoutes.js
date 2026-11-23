import { Router } from "express";
import { body, param } from "express-validator";
import {
  getProgressEntries,
  getLatestProgress,
  createProgressEntry,
  updateProgressEntry,
  deleteProgressEntry
} from '../controllers/progressController.js';
import { verifyToken } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
const router = Router();
router.use(verifyToken);
router.get("/", getProgressEntries);
router.get("/latest", getLatestProgress);
router.post(
  "/",
  [
    body("weight").isNumeric().withMessage("Weight is required and must be numeric"),
    validateRequest
  ],
  createProgressEntry
);
router.put(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid progress entry ID"), validateRequest],
  updateProgressEntry
);
router.delete(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid progress entry ID"), validateRequest],
  deleteProgressEntry
);
var stdin_default = router;
export {
  stdin_default as default
};
