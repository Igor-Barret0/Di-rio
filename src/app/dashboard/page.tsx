"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
  BarChart3,
  Flame,
  HeartPulse,
  Brain,
  PlayCircle,
  Calendar,
  ArrowRight,
  TrendingUp,
  Sparkles,
  ChevronRight,
  Target,
  Trophy,
  Plus,
  Minus,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppShell } from "@/components/layout/AppShell";
import { MoodSelector } from "@/components/mood/MoodSelector";
import { EmotionChart } from "@/components/charts/EmotionChart";
import { useMoodRecords } from "@/hooks/useMoodRecords";
import {
  formatTodayLongPtBR,
  getCurrentStreak,
  getLastNDays,
  getTodayISO,
} from "@/lib/storage/moodStorage";
import type { MoodKey } from "@/lib/moods/types";
import { MOOD_OPTIONS, moodLabel } from "@/lib/moods/options";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

function mostFrequentMoodLabel(records: { mood: MoodKey }[]) {
  const counts = records.reduce<Record<MoodKey, number>>((acc, r) => {
    acc[r.mood] = (acc[r.mood] ?? 0) + 1;
    return acc;
  }, {} as Record<MoodKey, number>);

  let top: MoodKey | null = null;
  let topCount = -1;
  (Object.keys(counts) as MoodKey[]).forEach((k) => {
    if (counts[k] > topCount) {
      top = k;
      topCount = counts[k];
    }
  });

  return top ? moodLabel(top) : "-";
}

function weeklyWellBeingPercent(records: { mood: MoodKey }[]) {
  if (records.length === 0) return 0;
  const avg =
    records.reduce((sum, r) => {
      const score = MOOD_OPTIONS.find((m) => m.key === r.mood)?.score ?? 0;
      return sum + score;
    }, 0) / records.length;

  return Math.round((avg / 4) * 100);
}

export default function DashboardPage() {
  const { records, loading, saveToday } = useMoodRecords();
  const todayISO = getTodayISO();
  const todayRecord = records.find((r) => r.dateISO === todayISO);

  const [mood, setMood] = React.useState<MoodKey | null>(todayRecord?.mood ?? null);
  const [videoId, setVideoId] = React.useState<string | null>(null);

  React.useEffect(() => {
    setMood(todayRecord?.mood ?? null);
  }, [todayRecord?.mood]);

  // Onboarding: mostra tela de boas-vindas se não há nenhum registro ainda
  const [onboardingDone, setOnboardingDone] = React.useState(false);
  const showOnboarding = !loading && records.length === 0 && !onboardingDone;

  const onChange = (m: MoodKey, note?: string) => {
    setMood(m);
    saveToday(m, note);
    setOnboardingDone(true);
  };

  const last7 = React.useMemo(() => getLastNDays(records, 7), [records]);
  const streak = React.useMemo(() => getCurrentStreak(records), [records]);
  const wellBeing = React.useMemo(() => weeklyWellBeingPercent(last7), [last7]);
  const topMood = React.useMemo(() => mostFrequentMoodLabel(records), [records]);

  // Confetti em milestones de streak
  const [streakMilestone, setStreakMilestone] = React.useState<number | null>(null);
  const prevStreak = React.useRef(streak);

  // Meta de bem-estar
  const GOAL_KEY = "diario_goal_v1";
  const [goalDays, setGoalDays] = React.useState<number>(() => {
    if (typeof window === "undefined") return 7;
    return Number(window.localStorage.getItem(GOAL_KEY) ?? 7);
  });
  const [editingGoal, setEditingGoal] = React.useState(false);
  const [goalInput, setGoalInput] = React.useState(String(goalDays));
  const saveGoal = (val: number) => {
    const clamped = Math.max(1, Math.min(365, val));
    setGoalDays(clamped);
    setGoalInput(String(clamped));
    if (typeof window !== "undefined") window.localStorage.setItem(GOAL_KEY, String(clamped));
    setEditingGoal(false);
  };

  // Progresso da meta: dias com score >= 3 nos últimos goalDays dias
  const goalProgress = React.useMemo(() => {
    const lastN = getLastNDays(records, goalDays);
    const positive = lastN.filter((r) => {
      const score = MOOD_OPTIONS.find((m) => m.key === r.mood)?.score ?? 0;
      return score >= 3;
    }).length;
    return { positive, total: lastN.length, percent: Math.round((positive / Math.max(goalDays, 1)) * 100) };
  }, [records, goalDays]);

  // Comparativo semanal
  const weekComparison = React.useMemo(() => {
    const avg = (list: typeof records) => {
      if (list.length === 0) return null;
      const sum = list.reduce((s, r) => s + (MOOD_OPTIONS.find((m) => m.key === r.mood)?.score ?? 0), 0);
      return sum / list.length;
    };
    const thisWeek = avg(getLastNDays(records, 7));
    // semana passada: dias 8 a 14
    const allDays: string[] = [];
    for (let i = 14; i >= 8; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      allDays.push(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`);
    }
    const lastWeekRecords = records.filter(r => allDays.includes(r.dateISO));
    const lastWeek = avg(lastWeekRecords);
    const diff = thisWeek !== null && lastWeek !== null ? thisWeek - lastWeek : null;
    return { thisWeek, lastWeek, diff };
  }, [records]);
  React.useEffect(() => {
    const milestones = [7, 14, 30, 60, 100];
    if (streak > prevStreak.current && milestones.includes(streak)) {
      setStreakMilestone(streak);
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.5 },
        colors: ["#6366f1", "#8b5cf6", "#a78bfa", "#fbbf24", "#34d399"],
      });
      setTimeout(() => {
        confetti({
          particleCount: 80,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.6 },
        });
        confetti({
          particleCount: 80,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.6 },
        });
      }, 300);
    }
    prevStreak.current = streak;
  }, [streak]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <AppShell>
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-10 pb-12"
          >
            {/* Header card skeleton */}
            <Skeleton className="h-40 w-full rounded-4xl" />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-8">
                <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
                  {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-40 rounded-4xl" />)}
                </div>
                <Skeleton className="h-64 rounded-4xl" />
              </div>
              <div className="lg:col-span-4 space-y-4">
                <Skeleton className="h-32 rounded-2xl" />
                <Skeleton className="h-24 rounded-2xl" />
                <Skeleton className="h-24 rounded-2xl" />
                <Skeleton className="h-32 rounded-2xl" />
              </div>
            </div>
          </motion.div>
        ) : showOnboarding ? (
          <motion.div
            key="onboarding"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.5 }}
            className="min-h-[85vh] flex items-center justify-center py-8"
          >
            <div className="max-w-2xl w-full px-4 space-y-10">

              {/* Hero */}
              <div className="relative rounded-4xl overflow-hidden bg-linear-to-br from-primary/90 via-primary to-secondary p-8 md:p-12 text-white shadow-2xl shadow-primary/30">
                {/* blobs decorativos */}
                <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-secondary/30 rounded-full blur-2xl" />

                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                  <motion.div
                    initial={{ y: 0 }}
                    animate={{ y: [-8, 8, -8] }}
                    transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
                    className="text-7xl md:text-8xl select-none shrink-0 drop-shadow-xl"
                  >
                    📓
                  </motion.div>

                  <div className="text-center md:text-left space-y-3">
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-widest"
                    >
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                      </span>
                      Bem-vindo!
                    </motion.div>

                    <motion.h1
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-3xl md:text-4xl font-black tracking-tight leading-tight"
                    >
                      Seu Diário<br />
                      <span className="text-white/80">Emocional</span> começa aqui
                    </motion.h1>

                    <motion.p
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-white/80 font-semibold text-sm md:text-base leading-relaxed max-w-sm"
                    >
                      Um espaço seguro e privado para você acompanhar suas emoções, construir hábitos saudáveis e se conhecer melhor.
                    </motion.p>
                  </div>
                </div>
              </div>

              {/* Cards de recursos */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                {[
                  {
                    emoji: "😊",
                    color: "from-amber-400/20 to-orange-400/10",
                    border: "border-amber-200/50 dark:border-amber-500/20",
                    title: "Registro diário",
                    desc: "Capture seu humor em segundos, todos os dias",
                  },
                  {
                    emoji: "📊",
                    color: "from-blue-400/20 to-indigo-400/10",
                    border: "border-blue-200/50 dark:border-blue-500/20",
                    title: "Evolução visual",
                    desc: "Gráficos e calendário mostram sua jornada emocional",
                  },
                  {
                    emoji: "💡",
                    color: "from-emerald-400/20 to-teal-400/10",
                    border: "border-emerald-200/50 dark:border-emerald-500/20",
                    title: "Dicas personalizadas",
                    desc: "Conteúdos selecionados para o seu bem-estar",
                  },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className={`bg-linear-to-br ${item.color} border ${item.border} rounded-3xl p-5 space-y-3 backdrop-blur-sm`}
                  >
                    <span className="text-4xl">{item.emoji}</span>
                    <div>
                      <p className="font-black text-foreground text-sm">{item.title}</p>
                      <p className="text-xs text-muted-foreground font-medium leading-relaxed mt-0.5">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Seletor de humor */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 }}
                className="bg-card border border-border/50 rounded-4xl p-6 md:p-8 shadow-lg space-y-5"
              >
                <div className="text-center space-y-1">
                  <p className="text-xs font-black uppercase tracking-widest text-primary">Primeiro passo</p>
                  <h2 className="text-xl font-black text-foreground">Como você está se sentindo agora?</h2>
                  <p className="text-sm text-muted-foreground font-medium">Selecione o humor que melhor representa seu momento</p>
                </div>
                <MoodSelector value={mood} onChange={onChange} />
              </motion.div>

            </div>
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-10 pb-12"
          >
        <motion.div variants={itemVariants} className="relative">
          <div className="absolute -inset-1 bg-linear-to-r from-primary/20 to-secondary/20 rounded-4xl blur-xl opacity-50 -z-10" />
          <Card className="dee-bg overflow-hidden border-none p-0 shadow-xl rounded-4xl ring-1 ring-white/50 dark:ring-white/10">
            <div className="p-6 md:p-8 relative z-10">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-6">
                  <motion.div
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    className="relative group shrink-0"
                  >
                    <div className="absolute -inset-1.5 bg-linear-to-tr from-primary to-secondary rounded-full blur opacity-40 group-hover:opacity-70 transition duration-500" />
                    <Avatar className="h-16 w-16 border-4 border-white shadow-xl relative">
                      <AvatarImage src="https://github.com/shadcn.png" />
                      <AvatarFallback className="bg-primary/5 text-primary text-lg font-bold">JS</AvatarFallback>
                    </Avatar>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5, type: "spring" }}
                      className="absolute -bottom-0.5 -right-0.5 bg-secondary text-white p-1 rounded-full shadow-lg border-2 border-white"
                    >
                      <Sparkles className="h-3 w-3" />
                    </motion.div>
                  </motion.div>

                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/40 backdrop-blur-md border border-white/50 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-primary shadow-sm">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-secondary opacity-75"></span>
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-secondary"></span>
                      </span>
                      Perfil Estudante
                    </div>
                    <div>
                      <h1 className="text-3xl font-black tracking-tight md:text-4xl text-foreground leading-tight">
                        Olá, <span className="text-primary">João Silva</span>
                      </h1>
                      <p className="text-sm font-semibold text-muted-foreground/80 max-w-md leading-relaxed">
                        Seu espaço seguro para cultivar <span className="text-primary/80 font-bold italic underline decoration-primary/30 decoration-2 underline-offset-2">bem-estar</span>.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 lg:min-w-auto">
                  <div className="glass-morphism rounded-2xl p-4 shadow-lg space-y-3 min-w-45">
                    <div className="flex justify-between items-end">
                      <div className="space-y-0.5">
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Bem-estar</p>
                        <p className="text-2xl font-black text-foreground">{wellBeing}%</p>
                      </div>
                      <TrendingUp className="h-5 w-5 text-secondary mb-1" />
                    </div>
                    <Progress value={wellBeing} className="h-1.5 rounded-full bg-black/5 [&>div]:bg-linear-to-r [&>div]:from-secondary [&>div]:to-primary" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <motion.div
                      whileHover={{ y: -2 }}
                      className="bg-card/60 backdrop-blur-lg rounded-2xl p-3 border border-white/50 shadow-md text-center flex flex-col justify-center min-w-25"
                    >
                      <Flame className="h-4 w-4 text-orange-500 mx-auto mb-1" />
                      <p className="text-lg font-black text-foreground leading-none">{streak}</p>
                      <p className="text-[8px] font-black text-muted-foreground uppercase mt-1">Dias</p>
                    </motion.div>
                    <motion.div
                      whileHover={{ y: -2 }}
                      className="bg-card/60 backdrop-blur-lg rounded-2xl p-3 border border-white/50 shadow-md text-center flex flex-col justify-center min-w-25"
                    >
                      <Calendar className="h-4 w-4 text-primary mx-auto mb-1" />
                      <p className="text-xs font-black text-foreground uppercase leading-none">
                        {new Date().toLocaleDateString("pt-BR", { month: "long" }).replace(/^\w/, c => c.toUpperCase())}
                      </p>
                      <p className="text-[8px] font-black text-muted-foreground uppercase mt-1">Dia {String(new Date().getDate()).padStart(2, "0")}</p>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <motion.div variants={itemVariants} className="lg:col-span-8 space-y-8">
            <section className="space-y-6">
              <div className="flex items-end justify-between px-2">
                <div className="space-y-1">
                  <h2 className="text-2xl font-black tracking-tight text-foreground">Como você se sente?</h2>
                  <p className="text-sm font-bold text-muted-foreground">Escolha o emoji que representa seu agora</p>
                </div>
              </div>

              {/* Banner: lembrete de registro diário */}
              <AnimatePresence>
                {!loading && !todayRecord && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="flex items-center gap-3 bg-primary/5 border border-primary/15 rounded-2xl px-4 py-3"
                  >
                    <span className="text-xl">🌅</span>
                    <p className="text-sm font-bold text-primary">
                      Você ainda não registrou seu humor hoje. Como está se sentindo?
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="bg-transparent border-none rounded-none p-0 shadow-none ring-0">
                <MoodSelector value={mood} onChange={onChange} />
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-2xl font-black tracking-tight text-foreground">Sua Jornada</h2>
                <Link href="/historico" className="group flex items-center gap-2 text-xs font-black text-primary uppercase tracking-widest hover:opacity-70 transition-all">
                  Ver tudo <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              <Card className="border-none bg-card p-6 rounded-[2.5rem] card-shadow">
                <div className="h-70 w-full pt-4">
                  {last7.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center space-y-4 rounded-3xl border-2 border-dashed border-primary/10 p-8 text-center bg-primary/1">
                      <BarChart3 className="h-12 w-12 text-primary/20" />
                      <p className="text-sm font-bold text-muted-foreground">Sua evolução aparecerá aqui.</p>
                    </div>
                  ) : (
                    <EmotionChart records={last7} height={240} />
                  )}
                </div>
              </Card>
            </section>
          </motion.div>

          <motion.div variants={itemVariants} className="lg:col-span-4 space-y-6">
            <h2 className="text-2xl font-black tracking-tight text-foreground px-2">Insights</h2>
            <div className="grid gap-4">

              {/* Card de Meta */}
              <Card className="p-5 border-none bg-card shadow-premium rounded-2xl card-shadow space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    <p className="text-sm font-black text-foreground">Minha Meta</p>
                  </div>
                  <button
                    onClick={() => { setEditingGoal(!editingGoal); setGoalInput(String(goalDays)); }}
                    className="text-xs font-bold text-primary hover:opacity-70 transition-opacity"
                  >
                    {editingGoal ? "Cancelar" : "Editar"}
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {editingGoal ? (
                    <motion.div
                      key="edit"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="flex items-center gap-2"
                    >
                      <button onClick={() => setGoalInput(String(Math.max(1, Number(goalInput) - 1)))} className="p-1 rounded-lg hover:bg-muted transition-colors">
                        <Minus className="h-4 w-4 text-muted-foreground" />
                      </button>
                      <Input
                        type="number"
                        min={1}
                        max={365}
                        value={goalInput}
                        onChange={(e) => setGoalInput(e.target.value)}
                        className="text-center font-black text-lg w-20 rounded-xl border-border/50"
                        onKeyDown={(e) => e.key === "Enter" && saveGoal(Number(goalInput))}
                      />
                      <button onClick={() => setGoalInput(String(Math.min(365, Number(goalInput) + 1)))} className="p-1 rounded-lg hover:bg-muted transition-colors">
                        <Plus className="h-4 w-4 text-muted-foreground" />
                      </button>
                      <Button size="sm" onClick={() => saveGoal(Number(goalInput))} className="rounded-full font-bold px-4">OK</Button>
                    </motion.div>
                  ) : (
                    <motion.p
                      key="display"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs font-semibold text-muted-foreground"
                    >
                      {goalDays} dias com humor positivo
                    </motion.p>
                  )}
                </AnimatePresence>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-black">
                    <span className="text-muted-foreground">{goalProgress.positive} de {goalDays} dias</span>
                    <span className={goalProgress.percent >= 100 ? "text-emerald-600" : "text-primary"}>{goalProgress.percent}%</span>
                  </div>
                  <Progress
                    value={Math.min(goalProgress.percent, 100)}
                    className="h-2 rounded-full bg-black/5 [&>div]:bg-linear-to-r [&>div]:from-primary [&>div]:to-secondary"
                  />
                </div>

                {goalProgress.percent >= 100 && (
                  <div className="flex items-center gap-2 text-xs font-black text-emerald-600 bg-emerald-50 rounded-xl px-3 py-2">
                    <Trophy className="h-4 w-4" />
                    Meta concluída! 🎉
                  </div>
                )}
              </Card>

              {/* Card comparativo semanal */}
              <Card className="p-5 border-none bg-card shadow-premium rounded-2xl card-shadow space-y-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-secondary" />
                  <p className="text-sm font-black text-foreground">Comparativo Semanal</p>
                </div>
                {weekComparison.thisWeek === null ? (
                  <p className="text-xs font-semibold text-muted-foreground">Registre pelo menos um humor esta semana para ver o comparativo.</p>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Esta semana</p>
                        <p className="text-2xl font-black text-foreground">{weekComparison.thisWeek?.toFixed(1)}<span className="text-xs text-muted-foreground ml-1">/ 4</span></p>
                      </div>
                      {weekComparison.diff !== null && (
                        <div className={`flex items-center gap-1 text-sm font-black px-3 py-1 rounded-full ${weekComparison.diff >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
                          {weekComparison.diff >= 0 ? "▲" : "▼"} {Math.abs(weekComparison.diff).toFixed(1)}
                        </div>
                      )}
                    </div>
                    {weekComparison.lastWeek !== null && (
                      <p className="text-xs text-muted-foreground font-semibold">
                        Semana passada: <span className="font-black text-foreground">{weekComparison.lastWeek.toFixed(1)}</span>
                      </p>
                    )}
                    {weekComparison.diff !== null && (
                      <p className="text-xs font-bold text-muted-foreground">
                        {weekComparison.diff > 0 ? "📈 Você melhorou em relação à semana passada!" :
                         weekComparison.diff < 0 ? "📉 Essa semana foi mais difícil. Vai passar!" :
                         "➡️ Semana estável em relação à anterior."}
                      </p>
                    )}
                  </div>
                )}
              </Card>
              <Card className="p-4 border-none bg-card shadow-premium rounded-2xl card-shadow group cursor-pointer hover:ring-2 hover:ring-violet-500/20 transition-all" onClick={() => setVideoId("4DpFox98kyg")}>
                <div className="flex gap-4">
                  <div className="shrink-0 rounded-xl bg-violet-50 p-3 text-violet-600 shadow-inner group-hover:bg-violet-100 transition-colors">
                    <Brain className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-black text-foreground">Vídeo Educativo</p>
                    <p className="text-xs font-medium text-muted-foreground">Entenda como a ansiedade funciona no cérebro e aprenda estratégias práticas para lidar com ela no dia a dia.</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 border-none bg-card shadow-premium rounded-2xl card-shadow group cursor-pointer hover:ring-2 hover:ring-indigo-500/20 transition-all" onClick={() => setVideoId("4JAn8AC5BFU")}>
                <div className="flex gap-4">
                  <div className="shrink-0 rounded-xl bg-indigo-50 p-3 text-indigo-600 shadow-inner group-hover:bg-indigo-100 transition-colors">
                    <PlayCircle className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-black text-foreground">Exercício de Respiração</p>
                    <p className="text-xs font-medium text-muted-foreground">Técnica 4-7-8: inspire por 4s, segure por 7s e solte por 8s. Ajuda a acalmar o sistema nervoso instantaneamente.</p>
                  </div>
                </div>
              </Card>

              <div className="bg-linear-to-br from-[#0F172A] to-[#1E293B] rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 bg-primary/20 h-20 w-20 rounded-full blur-2xl group-hover:bg-primary/40 transition duration-1000" />
                <HeartPulse className="h-8 w-8 text-secondary mb-4 relative z-10" />
                <p className="text-sm font-bold italic opacity-90 relative z-10 leading-relaxed">
                  "Seja gentil consigo mesmo nos dias difíceis."
                </p>
              </div>
            </div>
          </motion.div>
        </div>

      <Dialog open={videoId !== null} onOpenChange={(open) => { if (!open) setVideoId(null); }}>
        <DialogContent className="sm:max-w-2xl p-0 overflow-hidden rounded-2xl" showCloseButton>
          {videoId && (
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
              className="w-full aspect-video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Vídeo"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de celebração de streak */}
      <Dialog open={streakMilestone !== null} onOpenChange={(open) => { if (!open) setStreakMilestone(null); }}>
        <DialogContent className="sm:max-w-sm rounded-4xl text-center border-none shadow-2xl">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="py-4 space-y-4"
          >
            <div className="text-7xl select-none">🔥</div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-foreground tracking-tight">
                Incrível! {streakMilestone} dias seguidos!
              </h2>
              <p className="text-muted-foreground font-semibold text-sm leading-relaxed">
                Você está construindo um hábito poderoso de autoconhecimento. Continue assim!
              </p>
            </div>
            <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 border border-orange-200 rounded-full px-4 py-2 text-sm font-black">
              <Flame className="h-4 w-4" />
              {streakMilestone} dias de sequência
            </div>
            <Button
              className="w-full rounded-full bg-primary shadow-lg shadow-primary/20 font-bold"
              onClick={() => setStreakMilestone(null)}
            >
              Continuar minha jornada 🚀
            </Button>
          </motion.div>
        </DialogContent>
      </Dialog>
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}
