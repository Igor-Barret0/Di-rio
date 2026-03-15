import "dotenv/config";
import express from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import passport from "passport";

import { env } from "./config/env";
import { logger } from "./config/logger";
import { connectDB, disconnectDB } from "./config/database";
import { connectRedis } from "./config/redis";
import { initSocketServer } from "./config/socket";

// ── Routes ──────────────────────────────────────────────
import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import moodRoutes from "./routes/moods";
import challengeRoutes from "./routes/challenges";
import assessmentRoutes from "./routes/assessments";
import chatRoutes from "./routes/chat";
import notificationRoutes from "./routes/notifications";
import goalRoutes from "./routes/goals";
import resourceRoutes from "./routes/resources";
import adminRoutes from "./routes/admin";

// ── Middleware ───────────────────────────────────────────
import { errorHandler } from "./middleware/errorHandler";
import { rateLimiter } from "./middleware/rateLimiter";

// ── Realtime & background jobs ───────────────────────────
import { registerSocketHandlers } from "./socket/handlers";
import { startReminderCron } from "./cron/reminders";
import { startBadgeCron } from "./cron/badges";

const app = express();
const server = http.createServer(app);

// Socket.io — initialises the singleton used throughout the app
const io = initSocketServer(server);

// ── Global middleware ─────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.isDev ? "dev" : "combined", {
  stream: { write: (msg) => logger.http(msg.trim()) },
}));
app.use(rateLimiter);
app.use(passport.initialize());

// ── Health check ─────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", env: env.nodeEnv, ts: new Date().toISOString() });
});

// ── API routes ───────────────────────────────────────────
app.use("/api/auth",          authRoutes);
app.use("/api/users",         userRoutes);
app.use("/api/moods",         moodRoutes);
app.use("/api/challenges",    challengeRoutes);
app.use("/api/assessments",   assessmentRoutes);
app.use("/api/chat",          chatRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/goals",         goalRoutes);
app.use("/api/resources",     resourceRoutes);
app.use("/api/admin",         adminRoutes);

// ── 404 ──────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ── Error handler ─────────────────────────────────────────
app.use(errorHandler);

// ── Socket.io handlers ────────────────────────────────────
registerSocketHandlers(io);

// ── Bootstrap ─────────────────────────────────────────────
async function bootstrap() {
  try {
    await connectDB();
    await connectRedis();

    server.listen(env.port, () => {
      logger.info(`Server running on port ${env.port} [${env.nodeEnv}]`);
    });

    // Start background jobs after server is up
    startReminderCron();
    startBadgeCron();
  } catch (err) {
    logger.error("Bootstrap failed", { err });
    process.exit(1);
  }
}

// ── Graceful shutdown ─────────────────────────────────────
process.on("SIGTERM", async () => {
  logger.info("SIGTERM received — shutting down");
  server.close(async () => {
    await disconnectDB();
    process.exit(0);
  });
});

bootstrap();
