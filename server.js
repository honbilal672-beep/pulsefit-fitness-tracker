import "dotenv/config";
import express from "express";
import path from "node:path";
import fs from "node:fs";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { createServer as createViteServer } from "vite";
import { connectDB, disconnectDB } from "./server/config/db.js";
import { logger, morganStream } from "./server/config/logger.js";
import { apiLimiter } from "./server/middleware/rateLimiter.js";
import { notFoundHandler, errorHandler } from "./server/middleware/error.js";
import authRoutes from "./server/routes/authRoutes.js";
import workoutRoutes from "./server/routes/workoutRoutes.js";
import nutritionRoutes from "./server/routes/nutritionRoutes.js";
import progressRoutes from "./server/routes/progressRoutes.js";
import dashboardRoutes from "./server/routes/dashboardRoutes.js";
import analyticsRoutes from "./server/routes/analyticsRoutes.js";
import notificationRoutes from "./server/routes/notificationRoutes.js";
import reminderRoutes from "./server/routes/reminderRoutes.js";
import userRoutes from "./server/routes/userRoutes.js";
import reportRoutes from "./server/routes/reportRoutes.js";
import supportRoutes from "./server/routes/supportRoutes.js";

const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === "production";

async function startServer() {
  const app = express();

  let dbStatus = "connecting";
  const dbReadyPromise = (async () => {
    await connectDB();
    dbStatus = "connected";
    logger.info("Database connected cleanly.");
  })().catch((err) => {
    dbStatus = "error";
    logger.error(`Database initialization failed: ${err.message}`, { stack: err.stack });
    throw err;
  });

  const uploadDir = path.resolve(process.cwd(), "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false
    })
  );
  app.use(
    cors({
      origin: true,
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
    })
  );
  app.use(
    morgan(":method :url :status :res[content-length] - :response-time ms", {
      stream: morganStream,
      skip: (req) => req.url.startsWith("/@") || req.url.startsWith("/node_modules")
    })
  );
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));
  app.use("/uploads", express.static(uploadDir));
  app.use("/api", apiLimiter);

  app.get("/api/health", (_req, res) => {
    res.status(200).json({
      status: "healthy",
      service: "PulseFit Fitness Tracker API",
      dbStatus,
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      environment: process.env.NODE_ENV || "development"
    });
  });

  // Ensure database connection is ready before handling data API requests
  app.use("/api", async (req, _res, next) => {
    if (req.path === "/health") return next();
    try {
      await dbReadyPromise;
      next();
    } catch (err) {
      next(err);
    }
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/workouts", workoutRoutes);
  app.use("/api/nutrition", nutritionRoutes);
  app.use("/api/progress", progressRoutes);
  app.use("/api/dashboard", dashboardRoutes);
  app.use("/api/analytics", analyticsRoutes);
  app.use("/api/notifications", notificationRoutes);
  app.use("/api/reminders", reminderRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/reports", reportRoutes);
  app.use("/api/support", supportRoutes);
  app.use("/api/*", notFoundHandler);

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
    logger.info("Vite dev middleware attached to Express server.");
  } else {
    const distPath = path.resolve(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }

  app.use(errorHandler);

  const server = app.listen(PORT, "0.0.0.0", () => {
    logger.info(`Server successfully started and listening on http://0.0.0.0:${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
  });

  const handleShutdown = async (signal) => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);
    server.close(async () => {
      logger.info("HTTP server closed.");
      await disconnectDB();
      process.exit(0);
    });
  };
  process.on("SIGTERM", () => handleShutdown("SIGTERM"));
  process.on("SIGINT", () => handleShutdown("SIGINT"));
}

startServer().catch((err) => {
  logger.error(`Fatal error during server startup: ${err.message}`, { stack: err.stack });
  process.exit(1);
});
