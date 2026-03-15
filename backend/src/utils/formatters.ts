import { PageMeta } from "../types";

/**
 * Normaliza email: lowercase + remove pontos no local-part de Gmail/Googlemail.
 * igor.barr3to09@gmail.com → igorbarr3to09@gmail.com
 */
export function normalizeEmail(email: string): string {
  const lower = email.trim().toLowerCase();
  const atIdx = lower.indexOf("@");
  if (atIdx === -1) return lower;
  const local  = lower.slice(0, atIdx);
  const domain = lower.slice(atIdx + 1);
  if (domain === "gmail.com" || domain === "googlemail.com") {
    return `${local.replace(/\./g, "")}@${domain}`;
  }
  return lower;
}

export function toDateISO(date: Date = new Date()): string {
  // Use local time (server timezone = America/Sao_Paulo) to match frontend getTodayISO()
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function pageMetadata(total: number, page: number, limit: number): PageMeta {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Level formula: each level N requires N * 100 XP to advance.
 * Level 1: 0–100, Level 2: 100–300, Level 3: 300–600, etc.
 */
export function calcLevel(xp: number): { level: number; xpToNext: number } {
  let level = 1;
  let threshold = 100;
  let accumulated = 0;

  while (xp >= accumulated + threshold) {
    accumulated += threshold;
    level++;
    threshold = 100 * level;
  }

  return { level, xpToNext: accumulated + threshold - xp };
}

export function calcCurrentStreak(dates: string[]): number {
  if (dates.length === 0) return 0;

  const sorted = [...new Set(dates)].sort().reverse();
  let streak = 0;
  let current = toDateISO();

  for (const date of sorted) {
    if (date === current) {
      streak++;
      const d = new Date(current);
      d.setDate(d.getDate() - 1);
      current = toDateISO(d);
    } else if (date < current) {
      break;
    }
  }

  return streak;
}
