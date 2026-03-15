import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/database";
import { AppError } from "../middleware/errorHandler";
import { hashPassword, comparePassword } from "../utils/crypto";
import { calcLevel } from "../utils/formatters";
import { getTotalXP } from "../services/GamificationService";
import { logoutAll } from "../services/AuthService";

export async function getProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        userBadges: {
          include: { badge: true },
          orderBy: { unlockedAt: "desc" },
        },
      },
    });

    if (!user) return next(new AppError(404, "Usuário não encontrado"));

    const { passwordHash, ...safe } = user as Record<string, unknown>;
    const totalXP = await getTotalXP(userId);
    const { level, xpToNext } = calcLevel(totalXP);

    res.json({ ...safe, totalXP, level, xpToNext });
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const {
      name,
      avatarUrl,
      school,
      grade,
      birthDate,
      bio,
      timezone,
      reminderEnabled,
      reminderTime,
    } = req.body;

    const userUpdate: Record<string, unknown> = {};
    if (name !== undefined) userUpdate.name = name;
    if (avatarUrl !== undefined) userUpdate.avatarUrl = avatarUrl;

    const user = await prisma.user.update({
      where: { id: userId },
      data: userUpdate,
    });

    const profileData: Record<string, unknown> = {};
    if (school !== undefined) profileData.school = school;
    if (grade !== undefined) profileData.grade = grade;
    if (birthDate !== undefined) profileData.birthDate = new Date(birthDate);
    if (bio !== undefined) profileData.bio = bio;
    if (timezone !== undefined) profileData.timezone = timezone;
    if (reminderEnabled !== undefined) profileData.reminderEnabled = reminderEnabled;
    if (reminderTime !== undefined) profileData.reminderTime = reminderTime;

    const profile = await prisma.profile.upsert({
      where: { userId },
      create: { userId, ...profileData },
      update: profileData,
    });

    const { passwordHash, ...safe } = user as Record<string, unknown>;
    res.json({ ...safe, profile });
  } catch (err) {
    next(err);
  }
}

export async function changePassword(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.passwordHash) {
      return next(new AppError(400, "Não é possível alterar a senha de contas vinculadas ao Google"));
    }

    const valid = await comparePassword(currentPassword, user.passwordHash);
    if (!valid) return next(new AppError(401, "Senha atual incorreta"));

    const passwordHash = await hashPassword(newPassword);
    await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
    await logoutAll(userId);

    res.json({ message: "Senha atualizada. Faça login novamente." });
  } catch (err) {
    next(err);
  }
}

export async function getStats(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;

    const [totalMoods, totalChallengesCompleted, badges, totalXP] = await Promise.all([
      prisma.moodRecord.count({ where: { userId } }),
      prisma.userChallenge.count({ where: { userId, completedAt: { not: null } } }),
      prisma.userBadge.findMany({
        where: { userId },
        include: { badge: true },
        orderBy: { unlockedAt: "desc" },
      }),
      getTotalXP(userId),
    ]);

    const { level, xpToNext } = calcLevel(totalXP);

    res.json({
      totalMoods,
      totalChallengesCompleted,
      totalBadges: badges.length,
      badges,
      totalXP,
      level,
      xpToNext,
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteAccount(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { password } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user?.passwordHash) {
      if (!password) return next(new AppError(400, "Informe sua senha para excluir a conta"));
      const valid = await comparePassword(password, user.passwordHash);
      if (!valid) return next(new AppError(401, "Senha incorreta"));
    }

    await prisma.user.delete({ where: { id: userId } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
