const KEY = "diario_challenges_v1";

export interface ChallengeProgress {
  id: string;
  startedAt: string; // ISO date
  completedDays: string[]; // ISO dates
  completedAt?: string;
}

function load(): ChallengeProgress[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as ChallengeProgress[];
  } catch {
    return [];
  }
}

function save(data: ChallengeProgress[]) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function getChallengeProgress(): ChallengeProgress[] {
  return load();
}

export function joinChallenge(id: string): ChallengeProgress {
  const all = load();
  const existing = all.find((c) => c.id === id);
  if (existing) return existing;
  const entry: ChallengeProgress = { id, startedAt: new Date().toISOString(), completedDays: [] };
  save([...all, entry]);
  return entry;
}

export function markChallengeDay(id: string, dateISO: string): ChallengeProgress | null {
  const all = load();
  const idx = all.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  const entry = { ...all[idx] };
  if (!entry.completedDays.includes(dateISO)) {
    entry.completedDays = [...entry.completedDays, dateISO];
  }
  all[idx] = entry;
  save(all);
  return entry;
}

export function completeChallenge(id: string): void {
  const all = load();
  const idx = all.findIndex((c) => c.id === id);
  if (idx === -1) return;
  all[idx] = { ...all[idx], completedAt: new Date().toISOString() };
  save(all);
}

export function leaveChallenge(id: string): void {
  save(load().filter((c) => c.id !== id));
}
