import { Router } from "express";
import { exportCSV, exportPDF } from '../controllers/reportController.js';
import { verifyToken } from '../middleware/auth.js';
const router = Router();
router.use(verifyToken);
router.get("/csv", exportCSV);
router.get("/pdf", exportPDF);
var stdin_default = router;
export {
  stdin_default as default
};
