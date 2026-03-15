import type { MoodRecord } from "@/lib/moods/types";
import { MOOD_OPTIONS } from "@/lib/moods/options";

export type RiskLevel = "none" | "low" | "medium" | "high";

export interface PredictiveInsight {
  riskLevel: RiskLevel;
  consecutiveNegative: number;
  trend: "improving" | "declining" | "stable" | "insufficient_data";
  worstDayOfWeek: string | null;
  message: string | null;
  suggestion: string | null;
}

const LOW_SCORE_MOODS = ["sad", "anxious"];
const DAY_NAMES = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

function scoreOf(mood: string) {
  return MOOD_OPTIONS.find((m) => m.key === mood)?.score ?? 0;
}

function isoToDate(iso: string) {
  return new Date(iso + "T12:00:00");
}

export function computePredictiveInsight(records: MoodRecord[]): PredictiveInsight {
  if (records.length < 3) {
    return {
      riskLevel: "none",
      consecutiveNegative: 0,
      trend: "insufficient_data",
      worstDayOfWeek: null,
      message: null,
      suggestion: null,
    };
  }

  const sorted = [...records].sort((a, b) => (a.dateISO > b.dateISO ? -1 : 1));

  // 1. Consecutive negative days (most recent)
  let consecutiveNegative = 0;
  for (const r of sorted) {
    if (LOW_SCORE_MOODS.includes(r.mood)) consecutiveNegative++;
    else break;
  }

  // 2. Trend: compare avg score last 7 days vs previous 7 days
  const last7 = sorted.slice(0, 7);
  const prev7 = sorted.slice(7, 14);
  const avgLast7 = last7.length > 0 ? last7.reduce((s, r) => s + scoreOf(r.mood), 0) / last7.length : null;
  const avgPrev7 = prev7.length > 0 ? prev7.reduce((s, r) => s + scoreOf(r.mood), 0) / prev7.length : null;

  let trend: PredictiveInsight["trend"] = "stable";
  if (avgLast7 !== null && avgPrev7 !== null) {
    const diff = avgLast7 - avgPrev7;
    if (diff <= -0.5) trend = "declining";
    else if (diff >= 0.5) trend = "improving";
    else trend = "stable";
  } else {
    trend = "insufficient_data";
  }

  // 3. Worst day of the week
  const byDay: Record<number, number[]> = {};
  records.forEach((r) => {
    const dow = isoToDate(r.dateISO).getDay();
    if (!byDay[dow]) byDay[dow] = [];
    byDay[dow].push(scoreOf(r.mood));
  });

  let worstDow: number | null = null;
  let worstAvg = Infinity;
  Object.entries(byDay).forEach(([dow, scores]) => {
    if (scores.length >= 2) {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      if (avg < worstAvg) { worstAvg = avg; worstDow = Number(dow); }
    }
  });
  const worstDayOfWeek = worstDow !== null && worstAvg < 2.5 ? DAY_NAMES[worstDow] : null;

  // 4. Risk level
  let riskLevel: RiskLevel = "none";
  if (consecutiveNegative >= 5 || (consecutiveNegative >= 3 && trend === "declining")) {
    riskLevel = "high";
  } else if (consecutiveNegative >= 3 || trend === "declining") {
    riskLevel = "medium";
  } else if (consecutiveNegative >= 2) {
    riskLevel = "low";
  }

  // 5. Message & suggestion
  let message: string | null = null;
  let suggestion: string | null = null;

  if (riskLevel === "high") {
    message = `Você registrou ${consecutiveNegative} dias seguidos com humor negativo.`;
    suggestion = "Considere conversar com alguém de confiança ou ligar para o CVV (188).";
  } else if (riskLevel === "medium") {
    message = trend === "declining"
      ? "Seu bem-estar vem diminuindo nos últimos dias."
      : `Você está com humor negativo há ${consecutiveNegative} dias.`;
    suggestion = worstDayOfWeek
      ? `${worstDayOfWeek} tende a ser seu dia mais difícil — planeje algo especial para esse dia.`
      : "Tente um exercício de respiração ou uma pausa consciente hoje.";
  } else if (riskLevel === "low") {
    message = "Você teve alguns dias difíceis recentemente.";
    suggestion = worstDayOfWeek
      ? `Seus dados mostram que ${worstDayOfWeek} costuma ser mais desafiador para você.`
      : "Continue registrando — reconhecer seus sentimentos já é um grande passo.";
  }

  if (trend === "improving" && riskLevel === "none") {
    message = "📈 Seu bem-estar está melhorando esta semana!";
    suggestion = "Continue com os hábitos que estão funcionando para você.";
  }

  return { riskLevel, consecutiveNegative, trend, worstDayOfWeek, message, suggestion };
}
