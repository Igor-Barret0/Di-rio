import type { MoodOption } from "@/lib/moods/types";

export const MOOD_OPTIONS: MoodOption[] = [
  {
    key: "happy",
    label: "Feliz",
    emoji: "🙂",
    description: "Sentindo-se bem hoje",
    score: 4,
    colorClass: "from-emerald-100 to-emerald-200 border-emerald-300 text-emerald-800",
    colorHex: "#86EFAC",
  },
  {
    key: "neutral",
    label: "Normal",
    emoji: "😐",
    description: "Dia tranquilo",
    score: 3,
    colorClass: "from-blue-100 to-blue-200 border-blue-300 text-blue-800",
    colorHex: "#93C5FD",
  },
  {
    key: "sad",
    label: "Triste",
    emoji: "😔",
    description: "Não está sendo fácil",
    score: 2,
    colorClass: "from-violet-100 to-violet-200 border-violet-300 text-violet-800",
    colorHex: "#C4B5FD",
  },
  {
    key: "anxious",
    label: "Ansioso",
    emoji: "😰",
    description: "Sentindo preocupação",
    score: 1,
    colorClass: "from-orange-100 to-orange-200 border-orange-300 text-orange-800",
    colorHex: "#FDBA74",
  },
];

export function moodLabel(key: MoodOption["key"]) {
  return MOOD_OPTIONS.find((m) => m.key === key)?.label ?? key;
}

export function moodEmoji(key: MoodOption["key"]) {
  return MOOD_OPTIONS.find((m) => m.key === key)?.emoji ?? "";
}

export function moodScore(key: MoodOption["key"]) {
  return MOOD_OPTIONS.find((m) => m.key === key)?.score ?? 0;
}
