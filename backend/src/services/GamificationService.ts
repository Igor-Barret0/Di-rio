import { prisma } from "../config/database";
import { NotificationType } from "@prisma/client";
import { createNotification } from "./NotificationService";
import { calcCurrentStreak } from "../utils/formatters";

export async function awardXP(
  userId: string,
  amount: number,
  source: string,
  sourceId?: string,
) {
  const tx = await prisma.xPTransaction.create({
    data: { userId, amount, source, sourceId },
  });

  const totalXP = await getTotalXP(userId);
  await checkXPBadges(userId, totalXP);

  return tx;
}

export async function getTotalXP(userId: string): Promise<number> {
  const result = await prisma.xPTransaction.aggregate({
    where: { userId },
    _sum: { amount: true },
  });
  return result._sum.amount ?? 0;
}

export async function checkStreakBadges(userId: string) {
  const records = await prisma.moodRecord.findMany({
    where: { userId },
    orderBy: { dateISO: "asc" },
    select: { dateISO: true },
  });

  const streak = calcCurrentStreak(records.map((r) => r.dateISO));

  const milestones: Record<number, string> = {
    7: "semana_completa",
    30: "mes_completo",
    100: "dedicado",
  };

  for (const [days, key] of Object.entries(milestones)) {
    if (streak >= Number(days)) {
      await unlockBadge(userId, key);
    }
  }
}

export async function unlockBadge(userId: string, badgeKey: string) {
  const badge = await prisma.badge.findUnique({ where: { key: badgeKey } });
  if (!badge) return;

  try {
    await prisma.userBadge.create({ data: { userId, badgeId: badge.id } });

    await awardXP(userId, badge.xpThreshold ?? 50, "badge_unlock", badge.id);

    await createNotification(
      userId,
      NotificationType.BADGE_UNLOCKED,
      `Badge desbloqueado: ${badge.name}`,
      `Parabéns! Você desbloqueou "${badge.name}". ${badge.icon}`,
      { badgeKey },
    );
  } catch {
    // Unique constraint: badge already unlocked — ignore
  }
}

async function checkXPBadges(userId: string, totalXP: number) {
  const badges = await prisma.badge.findMany({
    where: { xpThreshold: { not: null, lte: totalXP } },
  });

  for (const badge of badges) {
    await unlockBadge(userId, badge.key);
  }
}
