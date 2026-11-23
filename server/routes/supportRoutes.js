import { Router } from "express";
import { body, param } from "express-validator";
import {
  createTicket,
  getUserTickets,
  getTicketById,
  replyToTicket,
  getAllTickets,
  updateTicketStatus
} from '../controllers/supportController.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
const router = Router();
router.use(verifyToken);
router.post(
  "/",
  [
    body("subject").trim().notEmpty().withMessage("Subject is required"),
    body("message").trim().notEmpty().withMessage("Initial message is required"),
    validateRequest
  ],
  createTicket
);
router.get("/my-tickets", getUserTickets);
router.get(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid ticket ID"), validateRequest],
  getTicketById
);
router.post(
  "/:id/reply",
  [
    param("id").isMongoId().withMessage("Invalid ticket ID"),
    body("message").trim().notEmpty().withMessage("Reply message cannot be empty"),
    validateRequest
  ],
  replyToTicket
);
router.get("/admin/all", requireAdmin, getAllTickets);
router.patch(
  "/admin/:id/status",
  requireAdmin,
  [
    param("id").isMongoId().withMessage("Invalid ticket ID"),
    body("status").isIn(["open", "in_progress", "resolved", "closed"]).withMessage("Invalid ticket status"),
    validateRequest
  ],
  updateTicketStatus
);
var stdin_default = router;
export {
  stdin_default as default
};
