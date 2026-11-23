import { SupportTicket } from '../models/SupportTicket.js';
import { Notification } from '../models/Notification.js';
import { User } from '../models/User.js';
import { AppError } from '../middleware/error.js';
const createTicket = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { subject, category, priority, message } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError("User not found.", 404);
    }
    const ticket = new SupportTicket({
      user: userId,
      subject,
      category: category || "general",
      priority: priority || "medium",
      status: "open",
      messages: [
        {
          sender: userId,
          senderName: user.name,
          senderRole: user.role,
          message,
          createdAt: /* @__PURE__ */ new Date()
        }
      ],
      lastRepliedAt: /* @__PURE__ */ new Date()
    });
    await ticket.save();
    await Notification.create({
      user: userId,
      title: "Support Ticket Received \u{1F4CB}",
      message: `Your ticket "${subject}" (#${ticket._id.toString().slice(-6)}) has been submitted. Our team will review it.`,
      type: "support",
      link: "/support",
      metadata: { ticketId: ticket._id }
    });
    res.status(201).json({
      success: true,
      message: "Support ticket submitted successfully.",
      ticket
    });
  } catch (error) {
    next(error);
  }
};
const getUserTickets = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const tickets = await SupportTicket.find({ user: userId }).sort({ updatedAt: -1 }).lean();
    res.status(200).json({
      success: true,
      tickets
    });
  } catch (error) {
    next(error);
  }
};
const getTicketById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ticket = await SupportTicket.findById(id).populate("user", "username name email profilePicture");
    if (!ticket) {
      throw new AppError("Support ticket not found.", 404);
    }
    if (ticket.user._id.toString() !== req.user?.id && req.user?.role !== "admin") {
      throw new AppError("Access denied.", 403);
    }
    res.status(200).json({
      success: true,
      ticket
    });
  } catch (error) {
    next(error);
  }
};
const replyToTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const userId = req.user?.id;
    const isAdmin = req.user?.role === "admin";
    const ticket = await SupportTicket.findById(id);
    if (!ticket) {
      throw new AppError("Ticket not found.", 404);
    }
    if (ticket.user.toString() !== userId && !isAdmin) {
      throw new AppError("Access denied.", 403);
    }
    const currentUser = await User.findById(userId);
    ticket.messages.push({
      sender: currentUser._id,
      senderName: currentUser?.name || "Support Team",
      senderRole: isAdmin ? "admin" : "user",
      message,
      createdAt: /* @__PURE__ */ new Date()
    });
    ticket.lastRepliedAt = /* @__PURE__ */ new Date();
    if (isAdmin && ticket.status === "open") {
      ticket.status = "in_progress";
    }
    await ticket.save();
    if (isAdmin && ticket.user.toString() !== userId) {
      await Notification.create({
        user: ticket.user,
        title: "New Reply on Support Ticket \u{1F4AC}",
        message: `Admin replied on ticket "${ticket.subject}".`,
        type: "support",
        link: "/support",
        metadata: { ticketId: ticket._id }
      });
    }
    res.status(200).json({
      success: true,
      message: "Reply posted successfully.",
      ticket
    });
  } catch (error) {
    next(error);
  }
};
const getAllTickets = async (req, res, next) => {
  try {
    const { status, category, priority, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;
    const [tickets, total] = await Promise.all([
      SupportTicket.find(query).populate("user", "username name email profilePicture").sort({ updatedAt: -1 }).skip(skip).limit(limitNum).lean(),
      SupportTicket.countDocuments(query)
    ]);
    res.status(200).json({
      success: true,
      tickets,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
};
const updateTicketStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const ticket = await SupportTicket.findById(id);
    if (!ticket) {
      throw new AppError("Ticket not found.", 404);
    }
    ticket.status = status;
    await ticket.save();
    await Notification.create({
      user: ticket.user,
      title: `Ticket Status Updated: ${status.toUpperCase()} \u{1F504}`,
      message: `Your ticket "${ticket.subject}" has been marked as ${status.replace("_", " ")}.`,
      type: "support",
      link: "/support",
      metadata: { ticketId: ticket._id }
    });
    res.status(200).json({
      success: true,
      message: `Ticket status updated to ${status}.`,
      ticket
    });
  } catch (error) {
    next(error);
  }
};
export {
  createTicket,
  getAllTickets,
  getTicketById,
  getUserTickets,
  replyToTicket,
  updateTicketStatus
};
