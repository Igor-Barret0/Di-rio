import type { Badge, BadgeKey } from "./types";

export const XP_PER_RECORD = 10;

export const LEVELS = [
  { level: 1, label: "Iniciante",   minXP: 0    },
  { level: 2, label: "Explorador",  minXP: 100  },
  { level: 3, label: "Constante",   minXP: 300  },
  { level: 4, label: "Dedicado",    minXP: 600  },
  { level: 5, label: "Mestre",      minXP: 1000 },
  { level: 6, label: "Lendário",    minXP: 1500 },
];

export const BADGES: Record<BadgeKey, Badge> = {
  primeiro_registro: {
    key: "primeiro_registro",
    label: "1° Registro",
    description: "Fez seu primeiro registro emocional",
    emoji: "🌱",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/20",
    borderColor: "border-emerald-100 dark:border-emerald-900/30",
  },
  semana_completa: {
    key: "semana_completa",
    label: "Semana Completa",
    description: "Registrou humor por 7 dias seguidos",
    emoji: "📅",
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-950/20",
    borderColor: "border-blue-100 dark:border-blue-900/30",
  },
  explorador_emocoes: {
    key: "explorador_emocoes",
    label: "Explorador de Emoções",
    description: "Usou todos os tipos de humor disponíveis",
    emoji: "🧠",
    color: "text-violet-600",
    bgColor: "bg-violet-50 dark:bg-violet-950/20",
    borderColor: "border-violet-100 dark:border-violet-900/30",
  },
  constante: {
    key: "constante",
    label: "Mestre da Consistência",
    description: "Acumulou 30 registros no diário",
    emoji: "🏆",
    color: "text-amber-600",
    bgColor: "bg-amber-50 dark:bg-amber-950/20",
    borderColor: "border-amber-100 dark:border-amber-900/30",
  },
  veterano: {
    key: "veterano",
    label: "Veterano",
    description: "Manteve uma sequência de 14 dias",
    emoji: "💪",
    color: "text-orange-600",
    bgColor: "bg-orange-50 dark:bg-orange-950/20",
    borderColor: "border-orange-100 dark:border-orange-900/30",
  },
  guardiao: {
    key: "guardiao",
    label: "Guardião da Mente",
    description: "Manteve uma sequência de 30 dias",
    emoji: "🛡️",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50 dark:bg-indigo-950/20",
    borderColor: "border-indigo-100 dark:border-indigo-900/30",
  },
  lendario: {
    key: "lendario",
    label: "Lendário",
    description: "Acumulou 100 registros no diário",
    emoji: "👑",
    color: "text-rose-600",
    bgColor: "bg-rose-50 dark:bg-rose-950/20",
    borderColor: "border-rose-100 dark:border-rose-900/30",
  },
};

export const ALL_BADGE_KEYS: BadgeKey[] = Object.keys(BADGES) as BadgeKey[];
