import type { MoodKey, MoodRecord } from "@/lib/moods/types";

const STORAGE_KEY = "diario_emocional_records_v1";

function safeParse(json: string | null): MoodRecord[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(Boolean) as MoodRecord[];
  } catch {
    return [];
  }
}

export function getMoodRecords(): MoodRecord[] {
  if (typeof window === "undefined") return [];
  const json = window.localStorage.getItem(STORAGE_KEY);
  return safeParse(json)
    .filter((r) => typeof r?.dateISO === "string" && typeof r?.mood === "string")
    .sort((a, b) => (a.dateISO > b.dateISO ? 1 : -1));
}

export function upsertMoodForDate(dateISO: string, mood: MoodKey, note?: string): MoodRecord {
  if (typeof window === "undefined") {
    return { id: "server", dateISO, mood };
  }

  const records = getMoodRecords();
  const existing = records.find((r) => r.dateISO === dateISO);

  const record: MoodRecord = {
    id: existing?.id ?? crypto.randomUUID(),
    dateISO,
    mood,
    note,
  };

  const next = records.filter((r) => r.dateISO !== dateISO).concat(record);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return record;
}

export function getTodayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function formatTodayLongPtBR(date = new Date()) {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
}

export function getCurrentStreak(records: MoodRecord[], fromDate = new Date()) {
  const set = new Set(records.map((r) => r.dateISO));
  let streak = 0;
  for (let i = 0; i < 3650; i += 1) {
    const d = new Date(fromDate);
    d.setDate(fromDate.getDate() - i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const iso = `${yyyy}-${mm}-${dd}`;
    if (set.has(iso)) streak += 1;
    else break;
  }
  return streak;
}

export function getLastNDays(records: MoodRecord[], n: number) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - (n - 1));
  const cutoffISO = `${cutoff.getFullYear()}-${String(cutoff.getMonth() + 1).padStart(2, "0")}-${String(cutoff.getDate()).padStart(2, "0")}`;
  return records.filter((r) => r.dateISO >= cutoffISO);
}

export function countConsecutiveLowMood(
  records: MoodRecord[],
  lowMoods: MoodKey[] = ["sad", "anxious"],
) {
  const sorted = [...records].sort((a, b) => (a.dateISO < b.dateISO ? 1 : -1));
  let count = 0;
  for (const r of sorted) {
    if (lowMoods.includes(r.mood)) count += 1;
    else break;
  }
  return count;
}
