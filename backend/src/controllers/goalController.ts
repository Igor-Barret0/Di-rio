import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/database";
import { AppError } from "../middleware/errorHandler";
import { pageMetadata } from "../utils/formatters";
import { createNotification } from "../services/NotificationService";
import { NotificationType } from "@prisma/client";

export async function listGoals(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { completed, page = 1, limit = 50 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: Record<string, unknown> = { userId };
    if (completed === "true")  where.completed = true;
    if (completed === "false") where.completed = false;

    const [goals, total] = await Promise.all([
      prisma.goal.findMany({
        where,
        orderBy: [{ completed: "asc" }, { createdAt: "desc" }],
        skip,
        take: Number(limit),
      }),
      prisma.goal.count({ where }),
    ]);

    res.json({ goals, meta: pageMetadata(total, Number(page), Number(limit)) });
  } catch (err) {
    next(err);
  }
}

export async function createGoal(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { title, description, targetDate } = req.body;

    if (!title?.trim()) return next(new AppError(400, "O título é obrigatório"));

    const goal = await prisma.goal.create({
      data: {
        userId,
        title: String(title).trim(),
        description: description ?? null,
        targetDate: targetDate ? new Date(targetDate) : null,
      },
    });

    await createNotification(
      userId,
      NotificationType.SYSTEM,
      "Nova meta criada! 🎯",
      `"${goal.title}" foi adicionada à sua lista de metas.`,
    );

    res.status(201).json(goal);
  } catch (err) {
    next(err);
  }
}

export async function updateGoal(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { title, description, completed, targetDate } = req.body;

    const existing = await prisma.goal.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return next(new AppError(404, "Meta não encontrada"));
    }

    const data: Record<string, unknown> = {};
    if (title      !== undefined) data.title       = String(title).trim();
    if (description !== undefined) data.description = description;
    if (completed  !== undefined) data.completed   = Boolean(completed);
    if (targetDate !== undefined) data.targetDate  = targetDate ? new Date(targetDate) : null;

    const goal = await prisma.goal.update({ where: { id }, data });

    if (completed === true && !existing.completed) {
      await createNotification(
        userId,
        NotificationType.SYSTEM,
        "Meta concluída! 🎉",
        `Parabéns! Você concluiu: "${goal.title}".`,
      );
    }

    res.json(goal);
  } catch (err) {
    next(err);
  }
}

export async function deleteGoal(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const existing = await prisma.goal.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return next(new AppError(404, "Meta não encontrada"));
    }

    await prisma.goal.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
