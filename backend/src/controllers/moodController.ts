import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/database";
import { AppError } from "../middleware/errorHandler";
import { toDateISO, pageMetadata } from "../utils/formatters";
import { detectRiskLevel } from "../services/RiskDetectionService";
import { awardXP, checkStreakBadges } from "../services/GamificationService";
import { createNotification } from "../services/NotificationService";
import { NotificationType } from "@prisma/client";

export async function createOrUpdate(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { mood, note, dateISO = toDateISO() } = req.body;

    const riskLevel = note ? detectRiskLevel(note) : "NONE";

    const existing = await prisma.moodRecord.findUnique({
      where: { userId_dateISO: { userId, dateISO } },
    });

    const moodLabels: Record<string, string> = {
      happy: "Feliz 🙂", neutral: "Normal 😐", sad: "Triste 😔",
      anxious: "Ansioso 😰", angry: "Irritado 😠", excited: "Animado 😄", tired: "Cansado 😴",
    };

    let record;
    if (existing) {
      record = await prisma.moodRecord.update({
        where: { id: existing.id },
        data: { mood, note, riskLevel },
      });
      await createNotification(
        userId,
        NotificationType.SYSTEM,
        `Humor atualizado — ${moodLabels[mood] ?? mood}`,
        note ? `"${note.slice(0, 80)}${note.length > 80 ? "…" : ""}"` : "Seu registro de hoje foi atualizado.",
        { mood },
      );
    } else {
      record = await prisma.moodRecord.create({
        data: { userId, mood, note, dateISO, riskLevel },
      });

      // Award XP only on first creation of the day
      await awardXP(userId, 10, "mood_record", record.id);
      await checkStreakBadges(userId);

      await createNotification(
        userId,
        NotificationType.SYSTEM,
        `Humor registrado — ${moodLabels[mood] ?? mood}`,
        note ? `"${note.slice(0, 80)}${note.length > 80 ? "…" : ""}"` : "+10 XP conquistados hoje!",
        { mood },
      );
    }

    if (riskLevel === "HIGH") {
      await createNotification(
        userId,
        NotificationType.RISK_ALERT,
        "Estamos aqui por você",
        "Percebemos que você pode estar passando por um momento difícil. O CVV (188) está disponível 24h por dia, de forma gratuita e sigilosa.",
        { riskLevel },
      );
    }

    res.status(existing ? 200 : 201).json(record);
  } catch (err) {
    next(err);
  }
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { from, to, page = 1, limit = 30 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: Record<string, unknown> = { userId };
    if (from || to) {
      const dateFilter: Record<string, string> = {};
      if (from) dateFilter.gte = String(from);
      if (to) dateFilter.lte = String(to);
      where.dateISO = dateFilter;
    }

    const [records, total] = await Promise.all([
      prisma.moodRecord.findMany({
        where,
        orderBy: { dateISO: "desc" },
        skip,
        take: Number(limit),
      }),
      prisma.moodRecord.count({ where }),
    ]);

    res.json({ records, meta: pageMetadata(total, Number(page), Number(limit)) });
  } catch (err) {
    next(err);
  }
}

export async function getByDate(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { date } = req.params;

    const record = await prisma.moodRecord.findUnique({
      where: { userId_dateISO: { userId, dateISO: date } },
    });

    if (!record) return next(new AppError(404, "Registro não encontrado"));
    res.json(record);
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const record = await prisma.moodRecord.findUnique({ where: { id } });
    if (!record || record.userId !== userId) {
      return next(new AppError(404, "Record not found"));
    }

    await prisma.moodRecord.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function stats(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { from, to } = req.query;

    const where: Record<string, unknown> = { userId };
    if (from || to) {
      const dateFilter: Record<string, string> = {};
      if (from) dateFilter.gte = String(from);
      if (to) dateFilter.lte = String(to);
      where.dateISO = dateFilter;
    }

    const records = await prisma.moodRecord.findMany({
      where,
      select: { mood: true, dateISO: true },
    });

    const frequency: Record<string, number> = {};
    for (const r of records) {
      frequency[r.mood] = (frequency[r.mood] ?? 0) + 1;
    }

    const xpResult = await prisma.xPTransaction.aggregate({
      where: { userId },
      _sum: { amount: true },
    });

    res.json({
      total: records.length,
      frequency,
      totalXP: xpResult._sum.amount ?? 0,
    });
  } catch (err) {
    next(err);
  }
}
