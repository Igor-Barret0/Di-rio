import { prisma } from "../config/database";
import { NotificationType, Prisma } from "@prisma/client";
import { getIO } from "../config/socket";
import { logger } from "../config/logger";

export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  body: string,
  meta?: Record<string, unknown>,
) {
  const notification = await prisma.notification.create({
    data: { userId, type, title, body, meta: meta as Prisma.InputJsonValue | undefined },
  });

  // Push real-time notification to user's private room
  try {
    getIO().to(`user:${userId}`).emit("notification", notification);
  } catch {
    // Socket server may not be initialized in test environments
    logger.debug("Socket not available for notification push", { userId });
  }

  return notification;
}
