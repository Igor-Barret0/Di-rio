"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, AlertTriangle, CheckCircle2,
  ChevronRight, RotateCcw, Loader2, History, Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiFetch, getStoredTokens, ApiError } from "@/lib/api/client";
import { toast } from "sonner";

/* ─── Dados ──────────────────────────────────────────────────────────────────── */
const ANSWERS = [
  { value: 0, label: "Nenhuma vez",              color: "from-slate-400   to-gray-400",    ring: "ring-slate-400/40",   text: "text-slate-700  dark:text-slate-300"  },
  { value: 1, label: "Vários dias",               color: "from-amber-400  to-yellow-400",   ring: "ring-amber-400/40",   text: "text-amber-700  dark:text-amber-300"  },
  { value: 2, label: "Mais da metade dos dias",   color: "from-orange-400 to-amber-500",    ring: "ring-orange-400/40",  text: "text-orange-700 dark:text-orange-300" },
  { value: 3, label: "Quase todos os dias",        color: "from-rose-500   to-red-500",      ring: "ring-rose-400/40",    text: "text-rose-700   dark:text-rose-300"   },
];

const PHQ9_QUESTIONS = [
  "Pouco interesse ou prazer em fazer as coisas?",
  "Se sentindo para baixo, deprimido(a) ou sem esperança?",
  "Dificuldade para adormecer, manter o sono, ou dormindo demais?",
  "Se sentindo cansado(a) ou com pouca energia?",
  "Apetite diminuído ou aumentado?",
  "Se sentindo mal consigo mesmo(a) — ou achando que é um fracasso?",
  "Dificuldade para se concentrar nas coisas?",
  "Se movendo ou falando devagar? Ou ao contrário, agitado(a) demais?",
  "Pensamentos de que seria melhor estar morto(a) ou de se machucar?",
];

const GAD7_QUESTIONS = [
  "Se sentindo nervoso(a), ansioso(a) ou muito tenso(a)?",
  "Não conseguindo parar ou controlar as preocupações?",
  "Preocupando-se demais com coisas diferentes?",
  "Dificuldade para relaxar?",
  "Ficando tão agitado(a) que é difícil ficar parado(a)?",
  "Ficando facilmente irritado(a) ou irritável?",
  "Sentindo medo como se algo terrível fosse acontecer?",
];

type AssessmentType = "PHQ9" | "GAD7";

interface ApiResult {
  id: string;
  type: AssessmentType;
  score: number;
  riskLevel: "NONE" | "LOW" | "MEDIUM" | "HIGH";
  interpretation?: string;
  createdAt: string;
}

const RISK_CONFIG = {
  NONE:   { label: "Mínimo",   gradient: "from-emerald-500 to-teal-500",   light: "bg-emerald-50 dark:bg-emerald-950/20", border: "border-emerald-200/60",  text: "text-emerald-700 dark:text-emerald-300", bar: "bg-emerald-500", icon: CheckCircle2 },
  LOW:    { label: "Leve",     gradient: "from-amber-400 to-yellow-500",    light: "bg-amber-50   dark:bg-amber-950/20",   border: "border-amber-200/60",    text: "text-amber-700   dark:text-amber-300",   bar: "bg-amber-400",   icon: AlertTriangle },
  MEDIUM: { label: "Moderado", gradient: "from-orange-500 to-amber-500",   light: "bg-orange-50  dark:bg-orange-950/20",  border: "border-orange-200/60",   text: "text-orange-700  dark:text-orange-300",  bar: "bg-orange-500",  icon: AlertTriangle },
  HIGH:   { label: "Severo",   gradient: "from-rose-500 to-red-600",       light: "bg-rose-50    dark:bg-rose-950/20",    border: "border-rose-200/60",     text: "text-rose-700    dark:text-rose-300",    bar: "bg-rose-500",    icon: AlertTriangle },
};

/* ─── Formulário de avaliação ────────────────────────────────────────────────── */
function AssessmentForm({ type, questions, onResult }: {
  type: AssessmentType;
  questions: string[];
  onResult: (result: ApiResult) => void;
}) {
  const [answers, setAnswers] = React.useState<Record<number, number>>({});
  const [loading, setLoading] = React.useState(false);

  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === questions.length;
  const totalScore = Object.values(answers).reduce((a, b) => a + b, 0);
  const pct = Math.round((answeredCount / questions.length) * 100);

  const handleSubmit = async () => {
    if (!allAnswered || !getStoredTokens()) return;
    setLoading(true);
    try {
      const responses: Record<string, number> = {};
      for (let i = 0; i < questions.length; i++) responses[`q${i + 1}`] = answers[i];
      const result = await apiFetch<ApiResult>("/assessments", {
        method: "POST",
        body: JSON.stringify({ type, responses }),
      });
      onResult(result);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Erro ao enviar avaliação.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Instrução + progresso */}
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Nas últimas <span className="font-bold text-foreground">2 semanas</span>, com que frequência você foi incomodado(a) pelos problemas abaixo?
        </p>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-muted-foreground">{answeredCount} de {questions.length} respondidas</span>
            <span className={cn(allAnswered ? "text-emerald-600" : "text-muted-foreground")}>{pct}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-linear-to-r from-indigo-500 to-violet-500"
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>
      </div>

      {/* Questões */}
      <div className="space-y-3">
        {questions.map((q, i) => {
          const selected = answers[i];
          const isAnswered = selected !== undefined;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
              className={cn(
                "rounded-2xl border p-4 transition-all",
                isAnswered
                  ? "bg-indigo-50/50 dark:bg-indigo-950/10 border-indigo-200/50 dark:border-indigo-800/30"
                  : "bg-card border-border/50",
              )}
            >
              <p className="text-sm font-semibold text-foreground mb-3 leading-snug">
                <span className={cn("font-black mr-2 text-xs", isAnswered ? "text-indigo-500" : "text-muted-foreground/50")}>
                  {String(i + 1).padStart(2, "0")}.
                </span>
                {q}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {ANSWERS.map((a) => {
                  const isSelected = selected === a.value;
                  return (
                    <button
                      key={a.value}
                      onClick={() => setAnswers((prev) => ({ ...prev, [i]: a.value }))}
                      className={cn(
                        "relative px-3 py-2.5 rounded-xl text-xs font-bold text-center leading-tight transition-all border-2",
                        isSelected
                          ? cn("text-white border-transparent shadow-md bg-linear-to-br", a.color)
                          : "border-border/40 text-muted-foreground hover:border-border hover:text-foreground bg-background",
                      )}
                    >
                      {isSelected && (
                        <motion.div
                          layoutId={`selected-${i}`}
                          className="absolute inset-0 rounded-xl"
                          transition={{ duration: 0.2 }}
                        />
                      )}
                      <span className="relative">{a.label}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer submit */}
      <div className={cn(
        "rounded-2xl border p-4 flex items-center justify-between gap-4 transition-all",
        allAnswered
          ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200/60"
          : "bg-muted/30 border-border/40",
      )}>
        <div>
          <p className="text-xs font-bold text-foreground">
            {allAnswered ? `Pontuação total: ${totalScore}` : `Responda todas as ${questions.length} perguntas`}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {allAnswered ? "Pronto para calcular seu resultado" : `Faltam ${questions.length - answeredCount} respostas`}
          </p>
        </div>
        <button
          onClick={handleSubmit}
          disabled={!allAnswered || loading || !getStoredTokens()}
          className={cn(
            "h-10 px-5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0",
            allAnswered
              ? "bg-linear-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25 hover:opacity-90"
              : "bg-muted text-muted-foreground cursor-not-allowed",
          )}
        >
          {loading ? (
            <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Calculando...</>
          ) : (
            <>Ver resultado <ChevronRight className="w-3.5 h-3.5" /></>
          )}
        </button>
      </div>
    </div>
  );
}

/* ─── Resultado ──────────────────────────────────────────────────────────────── */
function ResultCard({ result, onReset }: { result: ApiResult; onReset: () => void }) {
  const risk = RISK_CONFIG[result.riskLevel];
  const Icon = risk.icon;
  const typeName = result.type === "PHQ9" ? "PHQ-9 · Depressão" : "GAD-7 · Ansiedade";
  const maxScore = result.type === "PHQ9" ? 27 : 21;
  const scorePct = Math.round((result.score / maxScore) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-4"
    >
      {/* Score card */}
      <div className={cn("rounded-3xl border p-6 text-center space-y-4", risk.light, risk.border)}>
        <div className={cn(
          "w-16 h-16 rounded-2xl bg-linear-to-br mx-auto flex items-center justify-center shadow-lg",
          risk.gradient,
        )}>
          <Icon className="w-8 h-8 text-white" />
        </div>

        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{typeName}</p>
          <div className="flex items-baseline justify-center gap-1">
            <span className={cn("text-5xl font-black", risk.text)}>{result.score}</span>
            <span className="text-xl text-muted-foreground font-bold">/ {maxScore}</span>
          </div>
          <div className={cn(
            "inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs font-black bg-linear-to-r text-white shadow-sm",
            risk.gradient,
          )}>
            Nível {risk.label}
          </div>
        </div>

        {/* Barra de score */}
        <div className="space-y-1">
          <div className="h-3 rounded-full bg-black/8 dark:bg-white/10 overflow-hidden">
            <motion.div
              className={cn("h-full rounded-full", risk.bar)}
              initial={{ width: 0 }}
              animate={{ width: `${scorePct}%` }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            />
          </div>
          <p className="text-[11px] text-muted-foreground font-medium text-right">{scorePct}% do máximo</p>
        </div>
      </div>

      {/* Interpretação */}
      {result.interpretation && (
        <div className="rounded-2xl border border-border/50 bg-card p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-2">Interpretação</p>
          <p className="text-sm text-foreground leading-relaxed">{result.interpretation}</p>
        </div>
      )}

      {/* Aviso HIGH */}
      {result.riskLevel === "HIGH" && (
        <div className="rounded-2xl border border-rose-200/60 bg-rose-50 dark:bg-rose-950/20 p-4 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-rose-700 dark:text-rose-400">Atenção importante</p>
            <p className="text-xs text-rose-600/80 dark:text-rose-500/80 mt-1 leading-relaxed">
              Resultados indicam nível severo. Fale com um adulto de confiança, profissional de saúde ou ligue para o CVV: <span className="font-black">188</span> (gratuito, 24h).
            </p>
          </div>
        </div>
      )}

      <button
        onClick={onReset}
        className="w-full h-11 rounded-2xl border border-border/60 text-sm font-bold text-muted-foreground hover:text-foreground hover:border-border flex items-center justify-center gap-2 transition-colors"
      >
        <RotateCcw className="w-4 h-4" /> Refazer avaliação
      </button>
    </motion.div>
  );
}

/* ─── Página principal ───────────────────────────────────────────────────────── */
export default function AvaliacoesPage() {
  const [activeType, setActiveType] = React.useState<AssessmentType>("PHQ9");
  const [result, setResult] = React.useState<ApiResult | null>(null);
  const [userManualReset, setUserManualReset] = React.useState(false);
  const [history, setHistory] = React.useState<ApiResult[]>([]);
  const isAuthenticated = !!getStoredTokens();

  React.useEffect(() => {
    if (!isAuthenticated || userManualReset) return;
    setResult(null);
    apiFetch<ApiResult>(`/assessments/latest/${activeType}`)
      .then(setResult).catch(() => {});
  }, [activeType, isAuthenticated, userManualReset]);

  const refreshHistory = React.useCallback(() => {
    if (!isAuthenticated) return;
    apiFetch<{ assessments: ApiResult[] }>("/assessments?limit=20")
      .then((r) => setHistory(r.assessments)).catch(() => {});
  }, [isAuthenticated]);

  React.useEffect(() => { refreshHistory(); }, [refreshHistory]);

  const handleReset = () => { setResult(null); setUserManualReset(true); };
  const handleTypeChange = (t: AssessmentType) => { setActiveType(t); setResult(null); setUserManualReset(false); };
  const handleResult = (r: ApiResult) => { setResult(r); refreshHistory(); };

  const TABS = [
    { type: "PHQ9" as const, label: "PHQ-9", sub: "Depressão", emoji: "😔", questions: 9, maxScore: 27, gradient: "from-violet-500 to-purple-600" },
    { type: "GAD7" as const, label: "GAD-7", sub: "Ansiedade", emoji: "😰", questions: 7, maxScore: 21, gradient: "from-blue-500 to-indigo-600" },
  ];

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
  const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

  return (
    <AppShell>
      <motion.div variants={container} initial="hidden" animate="show" className="max-w-2xl mx-auto space-y-6 pb-14">

        {/* ── Header ────────────────────────────────────────────────────────── */}
        <motion.div variants={fadeUp}>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-foreground">Avaliações</h1>
          </div>
          <p className="text-sm text-muted-foreground ml-13">
            Questionários validados para rastreio de sintomas de ansiedade e depressão.
          </p>
        </motion.div>

        {/* ── Aviso clínico ──────────────────────────────────────────────────── */}
        <motion.div variants={fadeUp}>
          <div className="flex gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/30">
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed font-medium self-center">
              Estas avaliações são ferramentas de rastreio, <span className="font-bold">não diagnóstico clínico</span>. Resultados elevados devem ser discutidos com um profissional de saúde.
            </p>
          </div>
        </motion.div>

        {/* ── Seletor de questionário ────────────────────────────────────────── */}
        <motion.div variants={fadeUp}>
          <div className="grid grid-cols-2 gap-3">
            {TABS.map((t) => {
              const isActive = activeType === t.type;
              return (
                <button
                  key={t.type}
                  onClick={() => handleTypeChange(t.type)}
                  className={cn(
                    "relative rounded-2xl border-2 p-5 text-left transition-all overflow-hidden",
                    isActive
                      ? "border-transparent shadow-lg"
                      : "border-border/50 bg-card hover:border-border",
                  )}
                >
                  {/* Gradient bg when active */}
                  {isActive && (
                    <div className={cn("absolute inset-0 bg-linear-to-br opacity-10", t.gradient)} />
                  )}
                  {isActive && (
                    <div className={cn("absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r", t.gradient)} />
                  )}

                  <div className="relative">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 shadow-sm",
                      isActive ? cn("bg-linear-to-br", t.gradient) : "bg-muted/50",
                    )}>
                      {t.emoji}
                    </div>
                    <p className={cn(
                      "text-base font-black",
                      isActive ? "text-foreground" : "text-foreground",
                    )}>{t.label}</p>
                    <p className="text-xs text-muted-foreground font-medium mt-0.5">{t.sub}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] font-bold text-muted-foreground/60 bg-muted/50 px-2 py-0.5 rounded-full">{t.questions} perguntas</span>
                      <span className="text-[10px] font-bold text-muted-foreground/60 bg-muted/50 px-2 py-0.5 rounded-full">máx {t.maxScore} pts</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* ── Formulário / Resultado ─────────────────────────────────────────── */}
        <motion.div variants={fadeUp}>
          <div className="rounded-3xl border border-border/50 bg-card shadow-sm overflow-hidden">
            {/* Card header */}
            <div className="px-6 py-4 border-b border-border/40 flex items-center gap-3">
              <div className={cn(
                "w-8 h-8 rounded-xl bg-linear-to-br flex items-center justify-center shadow-sm text-sm",
                activeType === "PHQ9" ? "from-violet-500 to-purple-600" : "from-blue-500 to-indigo-600",
              )}>
                {activeType === "PHQ9" ? "😔" : "😰"}
              </div>
              <div>
                <p className="text-sm font-black text-foreground">
                  {activeType === "PHQ9" ? "PHQ-9 — Rastreio de Depressão" : "GAD-7 — Rastreio de Ansiedade"}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {activeType === "PHQ9" ? "9 perguntas · máx 27 pts" : "7 perguntas · máx 21 pts"}
                </p>
              </div>
            </div>

            <div className="p-6">
              {!isAuthenticated ? (
                <div className="text-center py-10 space-y-3">
                  <div className="w-14 h-14 rounded-3xl bg-muted/50 flex items-center justify-center mx-auto">
                    <Brain className="w-7 h-7 text-muted-foreground/30" />
                  </div>
                  <p className="text-sm font-bold text-muted-foreground">Faça login para salvar e acompanhar suas avaliações.</p>
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  {result ? (
                    <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                      <ResultCard result={result} onReset={handleReset} />
                    </motion.div>
                  ) : (
                    <motion.div key={`form-${activeType}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                      <AssessmentForm
                        type={activeType}
                        questions={activeType === "PHQ9" ? PHQ9_QUESTIONS : GAD7_QUESTIONS}
                        onResult={handleResult}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── Histórico ──────────────────────────────────────────────────────── */}
        {isAuthenticated && history.length > 0 && (
          <motion.div variants={fadeUp} className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-linear-to-br from-slate-500 to-gray-600 flex items-center justify-center shadow-sm">
                <History className="w-3.5 h-3.5 text-white" />
              </div>
              <h2 className="text-lg font-black tracking-tight text-foreground">Histórico</h2>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {history.map((h) => {
                const risk = RISK_CONFIG[h.riskLevel];
                const Icon = risk.icon;
                const maxScore = h.type === "PHQ9" ? 27 : 21;
                return (
                  <div key={h.id} className={cn(
                    "rounded-2xl border p-4 flex items-center gap-3",
                    risk.light, risk.border,
                  )}>
                    <div className={cn("w-10 h-10 rounded-xl bg-linear-to-br flex items-center justify-center shrink-0 shadow-sm", risk.gradient)}>
                      <Icon className="w-4.5 h-4.5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-foreground">{h.type === "PHQ9" ? "PHQ-9" : "GAD-7"}</span>
                        <span className={cn("text-[10px] font-black px-2 py-0.5 rounded-full bg-linear-to-r text-white", risk.gradient)}>
                          {risk.label}
                        </span>
                      </div>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className={cn("text-lg font-black", risk.text)}>{h.score}</span>
                        <span className="text-xs text-muted-foreground font-bold">/ {maxScore}</span>
                      </div>
                    </div>
                    <span className="text-[11px] text-muted-foreground/60 font-medium shrink-0">
                      {new Date(h.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "2-digit" })}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

      </motion.div>
    </AppShell>
  );
}