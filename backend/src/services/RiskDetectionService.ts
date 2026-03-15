import { RiskLevel } from "@prisma/client";

const HIGH_RISK_KEYWORDS = [
  "suicid",
  "me matar",
  "quero morrer",
  "não quero mais viver",
  "acabar com tudo",
  "me machucar",
  "me cortar",
  "overdose",
  "pular da",
  "enforcamento",
  "se matar",
  "tirar minha vida",
  "não consigo mais continuar",
];

const MEDIUM_RISK_KEYWORDS = [
  "deprimido",
  "muito deprimido",
  "sem esperança",
  "desesperado",
  "desespero",
  "abandonado por todos",
  "nunca vai melhorar",
  "não tem saída",
  "sem saída",
  "não aguento mais",
  "crise de pânico",
  "não consigo respirar",
];

export function detectRiskLevel(text: string): RiskLevel {
  if (!text) return RiskLevel.NONE;

  const lower = text.toLowerCase();

  if (HIGH_RISK_KEYWORDS.some((kw) => lower.includes(kw))) {
    return RiskLevel.HIGH;
  }

  if (MEDIUM_RISK_KEYWORDS.some((kw) => lower.includes(kw))) {
    return RiskLevel.MEDIUM;
  }

  return RiskLevel.NONE;
}
