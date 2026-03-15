export type BadgeKey =
  | "primeiro_registro"
  | "semana_completa"
  | "explorador_emocoes"
  | "constante"
  | "veterano"
  | "guardiao"
  | "lendario";

export interface Badge {
  key: BadgeKey;
  label: string;
  description: string;
  emoji: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export interface GamificationState {
  totalXP: number;
  level: number;
  levelLabel: string;
  xpForNextLevel: number;
  xpInCurrentLevel: number;
  levelProgress: number; // 0-100 percent
  unlockedBadges: BadgeKey[];
}
