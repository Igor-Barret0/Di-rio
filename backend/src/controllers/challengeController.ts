import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/database";
import { AppError } from "../middleware/errorHandler";
import { toDateISO } from "../utils/formatters";
import { awardXP } from "../services/GamificationService";
import { createNotification } from "../services/NotificationService";
import { NotificationType } from "@prisma/client";

export async function listChallenges(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;

    const [challenges, userChallenges] = await Promise.all([
      prisma.challenge.findMany({ where: { isActive: true }, orderBy: { category: "asc" } }),
      prisma.userChallenge.findMany({ where: { userId } }),
    ]);

    const ucMap = new Map(userChallenges.map((uc) => [uc.challengeId, uc]));

    const result = challenges.map((c) => ({
      ...c,
      userChallenge: ucMap.get(c.id) ?? null,
    }));

    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function joinChallenge(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const challenge = await prisma.challenge.findUnique({ where: { id } });
    if (!challenge || !challenge.isActive) {
      return next(new AppError(404, "Desafio não encontrado"));
    }

    const existing = await prisma.userChallenge.findUnique({
      where: { userId_challengeId: { userId, challengeId: id } },
    });
    if (existing) return next(new AppError(409, "Você já está participando deste desafio"));

    const uc = await prisma.userChallenge.create({
      data: { userId, challengeId: id },
      include: { challenge: true },
    });

    res.status(201).json(uc);
  } catch (err) {
    next(err);
  }
}

export async function logProgress(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const today = toDateISO();

    const uc = await prisma.userChallenge.findUnique({
      where: { userId_challengeId: { userId, challengeId: id } },
      include: { challenge: true },
    });

    if (!uc) return next(new AppError(404, "Você não está participando deste desafio"));
    if (uc.completedAt) return next(new AppError(400, "Desafio já concluído"));
    if (uc.completedDays.includes(today)) {
      return next(new AppError(400, "Progresso já registrado hoje"));
    }

    const newDays = [...uc.completedDays, today];
    const isComplete = newDays.length >= uc.challenge.totalDays;

    const updated = await prisma.userChallenge.update({
      where: { id: uc.id },
      data: {
        completedDays: newDays,
        completedAt: isComplete ? new Date() : null,
      },
      include: { challenge: true },
    });

    if (isComplete) {
      await awardXP(userId, uc.challenge.xpReward, "challenge_complete", id);
      await createNotification(
        userId,
        NotificationType.CHALLENGE_COMPLETE,
        `Desafio concluído: ${uc.challenge.title}`,
        `Incrível! Você completou "${uc.challenge.title}" e ganhou ${uc.challenge.xpReward} XP! ${uc.challenge.emoji}`,
        { challengeId: id },
      );
    }

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function leaveChallenge(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const uc = await prisma.userChallenge.findUnique({
      where: { userId_challengeId: { userId, challengeId: id } },
    });

    if (!uc) return next(new AppError(404, "Você não está participando deste desafio"));
    if (uc.completedAt) return next(new AppError(400, "Não é possível sair de um desafio já concluído"));

    await prisma.userChallenge.delete({ where: { id: uc.id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function getMyProgress(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;

    const challenges = await prisma.userChallenge.findMany({
      where: { userId },
      include: { challenge: true },
      orderBy: { startedAt: "desc" },
    });

    res.json(challenges);
  } catch (err) {
    next(err);
  }
}
