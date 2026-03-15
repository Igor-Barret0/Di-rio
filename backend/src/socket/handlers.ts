import { Server as SocketServer } from "socket.io";
import { verifyAccessToken } from "../utils/jwt";
import { logger } from "../config/logger";

export function registerSocketHandlers(io: SocketServer) {
  // Authenticate socket connections via JWT in handshake
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) return next(new Error("Authentication required"));

    try {
      const payload = verifyAccessToken(token);
      (socket.data as Record<string, string>).userId = payload.userId;
      next();
    } catch {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = (socket.data as Record<string, string>).userId;

    // Join user's private room for targeted notifications
    socket.join(`user:${userId}`);
    logger.info("Socket connected", { id: socket.id, userId });

    socket.on("disconnect", () => {
      logger.info("Socket disconnected", { id: socket.id, userId });
    });
  });
}
