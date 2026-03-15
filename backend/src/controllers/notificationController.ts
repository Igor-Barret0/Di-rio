import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/database";
import { pageMetadata } from "../utils/formatters";

export async function listNotifications(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { page = 1, limit = 20, unread } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: Record<string, unknown> = { userId };
    if (unread === "true") where.read = false;

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: Number(limit),
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId, read: false } }),
    ]);

    res.json({
      notifications,
      unreadCount,
      meta: pageMetadata(total, Number(page), Number(limit)),
    });
  } catch (err) {
    next(err);
  }
}

export async function markAsRead(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    await prisma.notification.updateMany({
      where: { id, userId },
      data: { read: true },
    });

    res.json({ message: "Marcada como lida" });
  } catch (err) {
    next(err);
  }
}

export async function markAllAsRead(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;

    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });

    res.json({ message: "Todas as notificações marcadas como lidas" });
  } catch (err) {
    next(err);
  }
}

export async function deleteAll(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    await prisma.notification.deleteMany({ where: { userId } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
