import type { MoodRecord } from "@/lib/moods/types";
import type { BadgeKey, GamificationState } from "./types";
import { LEVELS, XP_PER_RECORD } from "./config";
import { getCurrentStreak } from "@/lib/storage/moodStorage";

/**
 * Derives gamification state purely from mood records — no extra storage needed.
 */
export function computeGamification(records: MoodRecord[], challengeXP = 0, totalXPOverride?: number): GamificationState {
  const totalXP = totalXPOverride ?? (records.length * XP_PER_RECORD + challengeXP);

  // Determine level
  let currentLevel = LEVELS[0];
  for (const lvl of LEVELS) {
    if (totalXP >= lvl.minXP) currentLevel = lvl;
    else break;
  }

  const nextLevelData = LEVELS.find((l) => l.level === currentLevel.level + 1);
  const xpForNextLevel = nextLevelData ? nextLevelData.minXP : currentLevel.minXP;
  const xpInCurrentLevel = totalXP - currentLevel.minXP;
  const xpNeeded = xpForNextLevel - currentLevel.minXP;
  const levelProgress = nextLevelData
    ? Math.min(100, Math.round((xpInCurrentLevel / xpNeeded) * 100))
    : 100;

  // Determine unlocked badges
  const unlockedBadges = computeBadges(records);

  return {
    totalXP,
    level: currentLevel.level,
    levelLabel: currentLevel.label,
    xpForNextLevel,
    xpInCurrentLevel,
    levelProgress,
    unlockedBadges,
  };
}

function computeBadges(records: MoodRecord[]): BadgeKey[] {
  const unlocked: BadgeKey[] = [];
  const total = records.length;
  const streak = getCurrentStreak(records);
  const usedMoods = new Set(records.map((r) => r.mood));

  if (total >= 1) unlocked.push("primeiro_registro");
  if (streak >= 7) unlocked.push("semana_completa");
  if (usedMoods.size >= 4) unlocked.push("explorador_emocoes");
  if (total >= 30) unlocked.push("constante");
  if (streak >= 14) unlocked.push("veterano");
  if (streak >= 30) unlocked.push("guardiao");
  if (total >= 100) unlocked.push("lendario");

  return unlocked;
}
