"use client";

import { AppShell } from "@/components/layout/AppShell";
import { useMoodRecords } from "@/hooks/useMoodRecords";
import { useChallenges } from "@/hooks/useChallenges";
import { CHALLENGES } from "@/lib/challenges/config";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Zap, CheckCircle2, Plus, LogOut, Flame, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import confetti from "canvas-confetti";

/* ─── Gradient map por cor do desafio ───────────────────────────────────────── */
const GRADIENT_MAP: Record<string, { bar: string; icon: string; progress: string; btn: string }> = {
  "text-indigo-600":  { bar: "from-indigo-500 to-violet-500",  icon: "from-indigo-500 to-violet-500",  progress: "bg-indigo-500",  btn: "from-indigo-600 to-violet-600"  },
  "text-emerald-600": { bar: "from-emerald-500 to-teal-500",   icon: "from-emerald-500 to-teal-500",   progress: "bg-emerald-500", btn: "from-emerald-600 to-teal-600"   },
  "text-amber-600":   { bar: "from-amber-500 to-orange-500",   icon: "from-amber-500 to-orange-500",   progress: "bg-amber-500",   btn: "from-amber-600 to-orange-600"   },
  "text-rose-600":    { bar: "from-rose-500 to-pink-500",      icon: "from-rose-500 to-pink-500",      progress: "bg-rose-500",    btn: "from-rose-600 to-pink-600"      },
};

/* ─── Day dots progress ──────────────────────────────────────────────────────── */
function DayDots({ total, completed, progressColor }: { total: number; completed: number; progressColor: string }) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: i * 0.04, duration: 0.2 }}
          className={cn(
            "w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black",
            i < completed
              ? cn(progressColor, "text-white shadow-sm")
              : "bg-black/6 dark:bg-white/8 text-muted-foreground/40",
          )}
        >
          {i < completed ? "✓" : i + 1}
        </motion.div>
      ))}
    </div>
  );
}

/* ─── Página ─────────────────────────────────────────────────────────────────── */
export default function DesafiosPage() {
  const { records } = useMoodRecords();
  const { states, join, markToday, leave } = useChallenges(records);

  const handleJoin = (id: string) => {
    join(id);
    toast.success("Desafio iniciado! 🎯", { description: "Marque o progresso todo dia." });
  };

  const handleMark = (id: string, title: string) => {
    markToday(id);
    const state = states.find((s) => s.id === id);
    const nextCompleted = (state?.completedDays ?? 0) + 1;
    const total = state?.totalDays ?? 0;
    if (nextCompleted >= total) {
      confetti({ particleCount: 140, spread: 80, origin: { y: 0.5 } });
      toast.success("Desafio concluído! 🏆", { description: `Parabéns por completar: ${title}`, duration: 5000 });
    } else {
      toast.success(`+1 dia marcado! 🔥`, { description: `${nextCompleted} de ${total} dias concluídos` });
    }
  };

  const handleLeave = (id: string) => {
    leave(id);
    toast.info("Desafio abandonado.");
  };

  const joined = states.filter((s) => s.joined).length;
  const completed = states.filter((s) => s.done).length;
  const available = CHALLENGES.length - joined;

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
  const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

  return (
    <AppShell>
      <motion.div variants={container} initial="hidden" animate="show" className="max-w-4xl mx-auto space-y-8 pb-14">

        {/* ── Header ────────────────────────────────────────────────────────── */}
        <motion.div variants={fadeUp}>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-foreground">Desafios</h1>
          </div>
          <p className="text-sm text-muted-foreground ml-13">
            Construa hábitos saudáveis um dia de cada vez.
          </p>
        </motion.div>

        {/* ── Stats ─────────────────────────────────────────────────────────── */}
        <motion.div variants={fadeUp} className="grid grid-cols-3 gap-2">
          {[
            {
              label: "Em andamento", value: joined - completed,
              icon: Flame, gradient: "from-indigo-500 to-violet-500",
              lightBg: "bg-indigo-50 dark:bg-indigo-950/20",
              border: "border-indigo-200/60 dark:border-indigo-800/30",
              numColor: "text-indigo-700 dark:text-indigo-300",
            },
            {
              label: "Concluídos", value: completed,
              icon: CheckCircle2, gradient: "from-emerald-500 to-teal-500",
              lightBg: "bg-emerald-50 dark:bg-emerald-950/20",
              border: "border-emerald-200/60 dark:border-emerald-800/30",
              numColor: "text-emerald-700 dark:text-emerald-300",
            },
            {
              label: "Disponíveis", value: available,
              icon: Target, gradient: "from-amber-500 to-orange-500",
              lightBg: "bg-amber-50 dark:bg-amber-950/20",
              border: "border-amber-200/60 dark:border-amber-800/30",
              numColor: "text-amber-700 dark:text-amber-300",
            },
          ].map((s) => (
            <div key={s.label} className={cn("rounded-2xl border p-4 space-y-3", s.lightBg, s.border)}>
              <div className={cn("w-9 h-9 rounded-xl bg-linear-to-br flex items-center justify-center shadow-sm", s.gradient)}>
                <s.icon className="w-4.5 h-4.5 text-white" />
              </div>
              <div>
                <p className={cn("text-2xl font-black", s.numColor)}>{s.value}</p>
                <p className="text-xs font-semibold text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* ── Desafios em andamento ──────────────────────────────────────────── */}
        <AnimatePresence>
          {states.some(s => s.joined && !s.done) && (
            <motion.div
              variants={fadeUp}
              initial="hidden" animate="show"
              className="space-y-3"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-linear-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-sm">
                  <Flame className="w-3.5 h-3.5 text-white" />
                </div>
                <h2 className="text-lg font-black tracking-tight text-foreground">Em andamento</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {CHALLENGES.filter(c => {
                  const s = states.find(st => st.id === c.id);
                  return s?.joined && !s.done;
                }).map(challenge => {
                  const state = states.find(s => s.id === challenge.id)!;
                  const g = GRADIENT_MAP[challenge.color] ?? GRADIENT_MAP["text-indigo-600"];
                  return (
                    <motion.div
                      key={challenge.id}
                      layout
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      className="rounded-3xl overflow-hidden bg-card border border-border/50 shadow-sm"
                    >
                      <div className={cn("h-1 w-full bg-linear-to-r", g.bar)} />
                      <div className="p-5 space-y-4">
                        <div className="flex items-start gap-3">
                          <div className={cn("w-12 h-12 rounded-2xl bg-linear-to-br flex items-center justify-center text-2xl shadow-sm shrink-0", g.icon)}>
                            {challenge.emoji}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-black text-foreground">{challenge.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{challenge.description}</p>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="text-xs font-black text-foreground">{state.percent}%</p>
                            <p className="text-[10px] text-muted-foreground/60 mt-0.5">{state.completedDays}/{state.totalDays} dias</p>
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="space-y-2">
                          <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <motion.div
                              className={cn("h-full rounded-full", g.progress)}
                              initial={{ width: 0 }}
                              animate={{ width: `${state.percent}%` }}
                              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                            />
                          </div>
                          <DayDots total={state.totalDays} completed={state.completedDays} progressColor={g.progress} />
                        </div>

                        {/* XP + actions */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                          <div className="flex items-center gap-1">
                            <Zap className={cn("w-3.5 h-3.5", challenge.color)} />
                            <span className={cn("text-xs font-black", challenge.color)}>+{challenge.xpReward} XP</span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              disabled={!state.canMarkToday}
                              onClick={() => handleMark(challenge.id, challenge.title)}
                              className={cn(
                                "h-8 px-4 rounded-xl text-xs font-bold text-white transition-opacity shadow-md whitespace-nowrap shrink-0",
                                "bg-linear-to-r disabled:opacity-40",
                                g.btn,
                              )}
                              style={{ boxShadow: undefined }}
                            >
                              {state.canMarkToday ? "✓ Marcar hoje" : "Já marcado"}
                            </button>
                            <button
                              onClick={() => handleLeave(challenge.id)}
                              className="h-8 w-8 rounded-xl border border-border/60 text-muted-foreground hover:text-rose-500 hover:border-rose-300 flex items-center justify-center transition-colors"
                            >
                              <LogOut className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Todos os desafios ──────────────────────────────────────────────── */}
        <motion.div variants={fadeUp} className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-linear-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-sm">
              <Trophy className="w-3.5 h-3.5 text-white" />
            </div>
            <h2 className="text-lg font-black tracking-tight text-foreground">Todos os Desafios</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {CHALLENGES.map((challenge) => {
              const state = states.find((s) => s.id === challenge.id)!;
              const g = GRADIENT_MAP[challenge.color] ?? GRADIENT_MAP["text-indigo-600"];

              return (
                <motion.div
                  key={challenge.id}
                  layout
                  className={cn(
                    "rounded-3xl overflow-hidden border transition-shadow",
                    challenge.bgColor, challenge.borderColor,
                    state.done ? "opacity-75" : "hover:shadow-md shadow-sm",
                  )}
                >
                  <div className={cn("h-1 w-full bg-linear-to-r", g.bar)} />
                  <div className="p-5">
                    <div className="flex items-start gap-3 mb-4">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl bg-linear-to-br flex items-center justify-center text-2xl shadow-sm shrink-0",
                        state.done ? "opacity-60 grayscale" : g.icon,
                      )}>
                        {challenge.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-black text-foreground leading-tight">{challenge.title}</p>
                          {state.done && (
                            <span className="shrink-0 text-[10px] font-black text-emerald-600 bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 rounded-full border border-emerald-200/60">
                              ✓ Concluído
                            </span>
                          )}
                          {state.joined && !state.done && (
                            <span className="shrink-0 text-[10px] font-black text-indigo-600 bg-indigo-100 dark:bg-indigo-900/40 px-2 py-0.5 rounded-full border border-indigo-200/60">
                              Em progresso
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{challenge.description}</p>
                      </div>
                    </div>

                    {/* Meta de dias */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/5 dark:bg-white/8">
                        <Flame className="w-3 h-3 text-orange-500" />
                        <span className="text-xs font-bold text-foreground">{challenge.totalDays} dias</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/5 dark:bg-white/8">
                        <Zap className={cn("w-3 h-3", challenge.color)} />
                        <span className={cn("text-xs font-bold", challenge.color)}>+{challenge.xpReward} XP</span>
                      </div>
                    </div>

                    {/* Progress (se em andamento) */}
                    {state.joined && !state.done && (
                      <div className="mb-4 space-y-2">
                        <div className="h-1.5 rounded-full bg-black/8 dark:bg-white/10 overflow-hidden">
                          <motion.div
                            className={cn("h-full rounded-full", g.progress)}
                            initial={{ width: 0 }}
                            animate={{ width: `${state.percent}%` }}
                            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                          />
                        </div>
                        <p className="text-[11px] text-muted-foreground font-semibold">{state.completedDays} de {state.totalDays} dias · {state.percent}%</p>
                      </div>
                    )}

                    {/* Ação */}
                    <div>
                      {state.done ? (
                        <div className="flex items-center justify-center gap-2 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 text-xs font-black">
                          <CheckCircle2 className="w-4 h-4" /> Parabéns, desafio concluído!
                        </div>
                      ) : !state.joined ? (
                        <button
                          onClick={() => handleJoin(challenge.id)}
                          className={cn(
                            "w-full h-9 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-1.5",
                            "bg-linear-to-r shadow-md hover:opacity-90 transition-opacity",
                            g.btn,
                          )}
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Iniciar desafio
                        </button>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            disabled={!state.canMarkToday}
                            onClick={() => handleMark(challenge.id, challenge.title)}
                            className={cn(
                              "flex-1 h-9 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-1.5",
                              "bg-linear-to-r disabled:opacity-40 hover:opacity-90 transition-opacity shadow-sm",
                              g.btn,
                            )}
                          >
                            {state.canMarkToday ? (
                              <><CheckCircle2 className="w-3.5 h-3.5" /> Marcar hoje</>
                            ) : (
                              "✓ Já marcado hoje"
                            )}
                          </button>
                          <button
                            onClick={() => handleLeave(challenge.id)}
                            className="h-9 w-9 rounded-xl border border-border/60 text-muted-foreground hover:text-rose-500 hover:border-rose-300 flex items-center justify-center transition-colors"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

      </motion.div>
    </AppShell>
  );
}