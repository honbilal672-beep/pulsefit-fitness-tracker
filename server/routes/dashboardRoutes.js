import { Router } from "express";
import { getDashboardOverview } from '../controllers/dashboardController.js';
import { verifyToken } from '../middleware/auth.js';
const router = Router();
router.use(verifyToken);
router.get("/", getDashboardOverview);
var stdin_default = router;
export {
  stdin_default as default
};
