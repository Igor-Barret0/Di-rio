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
  {
    key: "angry",
    label: "Irritado",
    emoji: "😤",
    description: "Sentindo raiva ou frustração",
    score: 1,
    colorClass: "from-red-100 to-red-200 border-red-300 text-red-800",
    colorHex: "#FCA5A5",
  },
  {
    key: "excited",
    label: "Animado",
    emoji: "🤩",
    description: "Cheio de energia e entusiasmo",
    score: 5,
    colorClass: "from-yellow-100 to-amber-200 border-amber-300 text-amber-800",
    colorHex: "#FCD34D",
  },
  {
    key: "tired",
    label: "Cansado",
    emoji: "😴",
    description: "Sem energia hoje",
    score: 2,
    colorClass: "from-slate-100 to-slate-200 border-slate-300 text-slate-700",
    colorHex: "#CBD5E1",
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
