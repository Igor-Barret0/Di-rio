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
  Calendar,
  TrendingUp,
  Sparkles,
  ChevronRight,
  Target,
  Trophy,
  Plus,
  Minus,
  BookOpen,
  Star,
  Zap,
  Wind,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppShell } from "@/components/layout/AppShell";
import { MoodSelector } from "@/components/mood/MoodSelector";
import { EmotionChart } from "@/components/charts/EmotionChart";
import { useMoodRecords } from "@/hooks/useMoodRecords";
import {
  getCurrentStreak,
  getLastNDays,
  getTodayISO,
} from "@/lib/storage/moodStorage";
import type { MoodKey } from "@/lib/moods/types";
import { MOOD_OPTIONS } from "@/lib/moods/options";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useGamification } from "@/hooks/useGamification";
import { BADGES } from "@/lib/gamification/config";
import type { BadgeKey } from "@/lib/gamification/types";
import { computePredictiveInsight } from "@/lib/analytics/predictive";
import { PredictiveInsightBanner } from "@/components/shared/PredictiveInsightBanner";
import { useUser } from "@/lib/context/UserContext";

function weeklyWellBeingPercent(records: { mood: MoodKey }[]) {
  if (records.length === 0) return 0;
  const avg =
    records.reduce((sum, r) => {
      const score = MOOD_OPTIONS.find((m) => m.key === r.mood)?.score ?? 0;
      return sum + score;
    }, 0) / records.length;
  return Math.round((avg / 4) * 100);
}

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.09 } },
};

function SectionHeader({
  icon: Icon,
  gradient,
  title,
  action,
}: {
  icon: React.ElementType;
  gradient: string;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-1">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-xl bg-linear-to-br ${gradient} flex items-center justify-center shadow-md`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <h2 className="text-lg font-black tracking-tight text-foreground">{title}</h2>
      </div>
      {action}
    </div>
  );
}

export default function DashboardPage() {
  const { records, loading, saveToday } = useMoodRecords();
  const todayISO = getTodayISO();
  const todayRecord = records.find((r) => r.dateISO === todayISO);
  const gamification = useGamification(records);

  const [mood, setMood] = React.useState<MoodKey | null>(todayRecord?.mood ?? null);
  const [videoId, setVideoId] = React.useState<string | null>(null);

  React.useEffect(() => {
    setMood(todayRecord?.mood ?? null);
  }, [todayRecord?.mood]);

  const [onboardingDone, setOnboardingDone] = React.useState(false);
  const showOnboarding = !loading && records.length === 0 && !onboardingDone;

  const predictive = React.useMemo(() => computePredictiveInsight(records), [records]);

  const { user } = useUser();
  const userName = user.name || "Estudante";
  const userInitials = userName.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  const prevBadges = React.useRef(gamification.unlockedBadges);

  const onChange = (m: MoodKey, note?: string, audioBase64?: string, audioDurationSec?: number) => {
    const isNewRecord = !todayRecord;
    setMood(m);
    saveToday(m, note, audioBase64, audioDurationSec);
    setOnboardingDone(true);
    if (isNewRecord) {
      toast.success("+10 XP ganhos!", {
        description: `Nível ${gamification.level} — ${gamification.levelLabel}`,
        duration: 3000,
      });
    }
  };

  React.useEffect(() => {
    const prev = prevBadges.current;
    const newBadges = gamification.unlockedBadges.filter((b) => !prev.includes(b));
    newBadges.forEach((key: BadgeKey) => {
      const badge = BADGES[key];
      toast.success(`Conquista desbloqueada! ${badge.emoji}`, {
        description: badge.label,
        duration: 5000,
      });
    });
    prevBadges.current = gamification.unlockedBadges;
  }, [gamification.unlockedBadges]);

  const last7 = React.useMemo(() => getLastNDays(records, 7), [records]);
  const streak = React.useMemo(() => getCurrentStreak(records), [records]);
  const wellBeing = React.useMemo(() => weeklyWellBeingPercent(last7), [last7]);

  const [streakMilestone, setStreakMilestone] = React.useState<number | null>(null);
  const prevStreak = React.useRef(streak);

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

  const goalProgress = React.useMemo(() => {
    const lastN = getLastNDays(records, goalDays);
    const positive = lastN.filter((r) => {
      const score = MOOD_OPTIONS.find((m) => m.key === r.mood)?.score ?? 0;
      return score >= 3;
    }).length;
    return { positive, total: lastN.length, percent: Math.round((positive / Math.max(goalDays, 1)) * 100) };
  }, [records, goalDays]);

  const weekComparison = React.useMemo(() => {
    const avg = (list: typeof records) => {
      if (list.length === 0) return null;
      const sum = list.reduce((s, r) => s + (MOOD_OPTIONS.find((m) => m.key === r.mood)?.score ?? 0), 0);
      return sum / list.length;
    };
    const thisWeek = avg(getLastNDays(records, 7));
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
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.5 }, colors: ["#6366f1", "#8b5cf6", "#a78bfa", "#fbbf24", "#34d399"] });
      setTimeout(() => {
        confetti({ particleCount: 80, angle: 60, spread: 55, origin: { x: 0, y: 0.6 } });
        confetti({ particleCount: 80, angle: 120, spread: 55, origin: { x: 1, y: 0.6 } });
      }, 300);
    }
    prevStreak.current = streak;
  }, [streak]);

  // ─── Greeting ───────────────────────────────────────────────────────────────
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

  return (
    <AppShell>
      <AnimatePresence mode="wait">
        {/* ── Skeleton ── */}
        {loading ? (
          <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8 pb-12">
            <Skeleton className="h-44 w-full rounded-4xl" />
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-8 space-y-6">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-40 rounded-4xl" />)}
                </div>
                <Skeleton className="h-64 rounded-4xl" />
              </div>
              <div className="md:col-span-4 space-y-4">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
              </div>
            </div>
          </motion.div>

        ) : showOnboarding ? (
          /* ── Onboarding ── */
          <motion.div
            key="onboarding"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.5 }}
            className="min-h-[90vh] flex items-center justify-center py-10 px-4"
          >
            <div className="max-w-xl w-full space-y-5">

              {/* Hero banner */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                className="relative rounded-[2.5rem] overflow-hidden shadow-2xl"
                style={{ background: "linear-gradient(135deg, oklch(0.48 0.22 268) 0%, oklch(0.40 0.20 285) 50%, oklch(0.55 0.18 300) 100%)" }}
              >
                {/* decorative blobs */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full opacity-20" style={{ background: "oklch(0.85 0.15 190)", filter: "blur(60px)" }} />
                  <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full opacity-15" style={{ background: "oklch(0.99 0 0)", filter: "blur(50px)" }} />
                  {/* grid pattern */}
                  <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
                </div>

                <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row items-center gap-7 text-white">
                  <motion.div
                    initial={{ y: 0 }}
                    animate={{ y: [-10, 10, -10] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    className="text-7xl select-none shrink-0 drop-shadow-2xl"
                  >
                    📓
                  </motion.div>

                  <div className="text-center md:text-left space-y-3">
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="inline-flex items-center gap-2 border border-white/25 rounded-full px-3.5 py-1.5 text-[10px] font-black uppercase tracking-widest"
                      style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(10px)" }}
                    >
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                      </span>
                      Bem-vindo!
                    </motion.div>

                    <motion.h1
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 }}
                      className="text-3xl md:text-4xl font-black tracking-tight leading-tight"
                    >
                      Seu Diário <span className="opacity-75">Emocional</span>
                      <br className="hidden sm:block" />
                      começa aqui ✨
                    </motion.h1>

                    <motion.p
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-sm md:text-base leading-relaxed max-w-sm font-medium opacity-80"
                    >
                      Seu espaço seguro e privado para acompanhar emoções, construir hábitos saudáveis e se conhecer melhor.
                    </motion.p>
                  </div>
                </div>
              </motion.div>

              {/* Feature cards */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.38, duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                className="grid grid-cols-3 gap-3"
              >
                {[
                  { icon: BookOpen, gradient: "from-indigo-500 to-violet-500", bg: "bg-indigo-50 dark:bg-indigo-950/30", border: "border-indigo-100 dark:border-indigo-900/40", title: "Registro diário", desc: "Capture seu humor em segundos" },
                  { icon: BarChart3, gradient: "from-emerald-500 to-teal-500", bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-100 dark:border-emerald-900/40", title: "Evolução visual", desc: "Gráficos da sua jornada" },
                  { icon: Sparkles, gradient: "from-amber-500 to-orange-500", bg: "bg-amber-50 dark:bg-amber-950/30", border: "border-amber-100 dark:border-amber-900/40", title: "Insights", desc: "Dicas para seu bem-estar" },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.44 + i * 0.07, duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                    className={`rounded-2xl p-4 space-y-2.5 border ${item.bg} ${item.border}`}
                  >
                    <div className={`w-8 h-8 rounded-xl bg-linear-to-br ${item.gradient} flex items-center justify-center shadow-md`}>
                      <item.icon className="w-4 h-4 text-white" />
                    </div>
                    <p className="font-black text-sm text-foreground leading-tight">{item.title}</p>
                    <p className="text-xs text-muted-foreground font-medium leading-relaxed">{item.desc}</p>
                  </motion.div>
                ))}
              </motion.div>

              {/* First mood picker */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.62, duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                className="bg-card rounded-4xl p-6 md:p-8 space-y-5 border border-border/50 shadow-xl"
              >
                {/* top gradient bar */}
                <div className="h-1 w-full bg-linear-to-r from-indigo-500 via-violet-500 to-purple-500 rounded-full -mt-6 mx-0 mb-0" style={{ marginLeft: "-1.5rem", marginRight: "-1.5rem", width: "calc(100% + 3rem)" }} />
                <div className="text-center space-y-1 pt-2">
                  <div className="inline-flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                    <Zap className="w-3 h-3" /> Primeiro passo
                  </div>
                  <h2 className="text-xl font-black text-foreground pt-1">Como você está se sentindo agora?</h2>
                  <p className="text-sm text-muted-foreground font-medium">Selecione o humor que melhor representa seu momento</p>
                </div>
                <MoodSelector value={mood} onChange={onChange} />
              </motion.div>

            </div>
          </motion.div>

        ) : (
          /* ── Dashboard ── */
          <motion.div
            key="dashboard"
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-8 pb-12 max-w-7xl mx-auto"
          >

            {/* ─── Hero header ─────────────────────────────────────────── */}
            <motion.div variants={fadeUp} className="relative">
              <div className="absolute -inset-1 bg-linear-to-r from-primary/15 via-violet-500/10 to-secondary/15 rounded-[2.5rem] blur-2xl -z-10" />
              <div className="relative rounded-[2.5rem] overflow-hidden border border-white/60 dark:border-white/8 shadow-xl bg-card">
                {/* gradient accent top strip */}
                <div className="h-1.5 w-full bg-linear-to-r from-indigo-500 via-violet-500 to-purple-500" />
                {/* subtle grid */}
                <div className="absolute inset-0 opacity-[0.025] pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

                <div className="p-6 md:p-8 relative z-10">
                  <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                    {/* Left: avatar + greeting */}
                    <div className="flex items-center gap-5">
                      <motion.div whileHover={{ scale: 1.05, rotate: 4 }} className="relative group shrink-0">
                        <div className="absolute -inset-1.5 bg-linear-to-tr from-primary to-secondary rounded-full blur opacity-35 group-hover:opacity-60 transition duration-500" />
                        <Avatar className="h-16 w-16 border-4 border-white dark:border-white/10 shadow-xl relative">
                          <AvatarImage src={user.avatarUrl ?? undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">{userInitials}</AvatarFallback>
                        </Avatar>
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.5, type: "spring" }}
                          className="absolute -bottom-0.5 -right-0.5 bg-linear-to-br from-violet-500 to-purple-600 text-white p-1.5 rounded-full shadow-lg border-2 border-white dark:border-background"
                        >
                          <Sparkles className="h-2.5 w-2.5" />
                        </motion.div>
                      </motion.div>

                      <div className="space-y-1">
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/40 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          </span>
                          Perfil Estudante
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground leading-tight">
                          {greeting}, <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-500 to-violet-600">{userName}</span>
                        </h1>
                        <p className="text-sm font-semibold text-muted-foreground max-w-xs leading-relaxed">
                          Seu espaço seguro para cultivar <span className="text-primary font-bold">bem-estar</span> ✨
                        </p>
                      </div>
                    </div>

                    {/* Right: stats */}
                    <div className="flex flex-wrap gap-3">
                      {/* Bem-estar */}
                      <div className="bg-white/60 dark:bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/70 dark:border-white/10 shadow-sm min-w-44 space-y-2.5">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Bem-estar</p>
                            <p className="text-2xl font-black text-foreground">{wellBeing}%</p>
                          </div>
                          <div className="w-8 h-8 rounded-xl bg-linear-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-md">
                            <TrendingUp className="h-3.5 w-3.5 text-white" />
                          </div>
                        </div>
                        <Progress value={wellBeing} className="h-1.5 rounded-full bg-black/6 [&>div]:bg-linear-to-r [&>div]:from-emerald-400 [&>div]:to-teal-500" />
                      </div>

                      {/* Streak */}
                      <motion.div whileHover={{ y: -2 }} className="bg-white/60 dark:bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/70 dark:border-white/10 shadow-sm min-w-28 flex flex-col items-center justify-center gap-1">
                        <div className="w-8 h-8 rounded-xl bg-linear-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-md">
                          <Flame className="h-3.5 w-3.5 text-white" />
                        </div>
                        <p className="text-xl font-black text-foreground leading-none">{streak}</p>
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Dias</p>
                      </motion.div>

                      {/* XP */}
                      <motion.div whileHover={{ y: -2 }} className="bg-white/60 dark:bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/70 dark:border-white/10 shadow-sm min-w-28 flex flex-col items-center justify-center gap-1">
                        <div className="w-8 h-8 rounded-xl bg-linear-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md">
                          <Star className="h-3.5 w-3.5 text-white" />
                        </div>
                        <p className="text-xl font-black text-foreground leading-none">{gamification.totalXP}</p>
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">XP</p>
                      </motion.div>

                      {/* Data */}
                      <motion.div whileHover={{ y: -2 }} className="bg-white/60 dark:bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/70 dark:border-white/10 shadow-sm min-w-28 flex flex-col items-center justify-center gap-1">
                        <div className="w-8 h-8 rounded-xl bg-linear-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-md">
                          <Calendar className="h-3.5 w-3.5 text-white" />
                        </div>
                        <p className="text-xs font-black text-foreground uppercase leading-none">
                          {new Date().toLocaleDateString("pt-BR", { month: "short" }).replace(/^\w/, c => c.toUpperCase())}
                        </p>
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Dia {String(new Date().getDate()).padStart(2, "0")}</p>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ─── Main grid ─────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8">

              {/* ── Left column ── */}
              <motion.div variants={fadeUp} className="md:col-span-8 space-y-8">

                {/* Mood section */}
                <section className="space-y-4">
                  <SectionHeader icon={HeartPulse} gradient="from-rose-500 to-pink-600" title="Como você se sente?" />

                  <AnimatePresence mode="wait">
                    {!loading && todayRecord ? (
                      <motion.div
                        key="registered"
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 rounded-2xl px-4 py-3"
                      >
                        <span className="text-xl">✅</span>
                        <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300 flex-1">
                          Humor de hoje já registrado — volte amanhã!
                        </p>
                        <span className="text-2xl">{MOOD_OPTIONS.find(o => o.key === todayRecord.mood)?.emoji}</span>
                      </motion.div>
                    ) : !loading && !todayRecord ? (
                      <motion.div
                        key="pending"
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="flex items-center gap-3 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-900/40 rounded-2xl px-4 py-3"
                      >
                        <span className="text-xl">🌅</span>
                        <p className="text-sm font-bold text-indigo-700 dark:text-indigo-300">
                          Você ainda não registrou seu humor hoje. Como está se sentindo?
                        </p>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>

                  <div className="bg-card rounded-3xl p-1 border border-border/40 shadow-md">
                    <MoodSelector value={mood} onChange={onChange} disabled={!!todayRecord} />
                  </div>
                </section>

                {/* Predictive banner */}
                {!loading && records.length >= 3 && (
                  <PredictiveInsightBanner insight={predictive} />
                )}

                {/* Journey / chart section */}
                <section className="space-y-4">
                  <SectionHeader
                    icon={BarChart3}
                    gradient="from-indigo-500 to-violet-600"
                    title="Sua Jornada"
                    action={
                      <Link href="/historico" className="group flex items-center gap-1.5 text-xs font-black text-primary uppercase tracking-widest hover:opacity-70 transition-all">
                        Ver tudo <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                      </Link>
                    }
                  />

                  <div className="bg-card border border-border/40 p-6 rounded-3xl shadow-md">
                    <div className="h-64 w-full">
                      {last7.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center space-y-3 rounded-2xl border-2 border-dashed border-border/40 p-8 text-center">
                          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center">
                            <BarChart3 className="h-6 w-6 text-indigo-400" />
                          </div>
                          <p className="text-sm font-bold text-muted-foreground">Sua evolução aparecerá aqui após os primeiros registros.</p>
                        </div>
                      ) : (
                        <EmotionChart records={last7} height={240} />
                      )}
                    </div>
                  </div>
                </section>
              </motion.div>

              {/* ── Right sidebar ── */}
              <motion.div variants={fadeUp} className="md:col-span-4 space-y-5">
                <div className="flex items-center gap-3 px-1">
                  <div className="w-8 h-8 rounded-xl bg-linear-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-lg font-black tracking-tight text-foreground">Insights</h2>
                </div>

                {/* Meta card */}
                <div className="bg-card border border-border/40 rounded-2xl p-5 shadow-md space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-linear-to-br from-primary to-violet-600 flex items-center justify-center shadow-sm">
                        <Target className="h-3.5 w-3.5 text-white" />
                      </div>
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
                      <motion.div key="edit" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="flex items-center gap-2">
                        <button onClick={() => setGoalInput(String(Math.max(1, Number(goalInput) - 1)))} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                          <Minus className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                        <Input
                          type="number" min={1} max={365} value={goalInput}
                          onChange={(e) => setGoalInput(e.target.value)}
                          className="text-center font-black text-base w-20 rounded-xl border-border/50"
                          onKeyDown={(e) => e.key === "Enter" && saveGoal(Number(goalInput))}
                        />
                        <button onClick={() => setGoalInput(String(Math.min(365, Number(goalInput) + 1)))} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                          <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                        <Button size="sm" onClick={() => saveGoal(Number(goalInput))} className="rounded-full font-bold px-3 text-xs">OK</Button>
                      </motion.div>
                    ) : (
                      <motion.p key="display" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs font-semibold text-muted-foreground">
                        {goalDays} dias com humor positivo
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-black">
                      <span className="text-muted-foreground">{goalProgress.positive} de {goalDays} dias</span>
                      <span className={goalProgress.percent >= 100 ? "text-emerald-600" : "text-primary"}>{goalProgress.percent}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-linear-to-r from-primary to-violet-500"
                        animate={{ width: `${Math.min(goalProgress.percent, 100)}%` }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                      />
                    </div>
                  </div>

                  {goalProgress.percent >= 100 && (
                    <div className="flex items-center gap-2 text-xs font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl px-3 py-2">
                      <Trophy className="h-3.5 w-3.5" /> Meta concluída! 🎉
                    </div>
                  )}
                </div>

                {/* Weekly comparison card */}
                <div className="bg-card border border-border/40 rounded-2xl p-5 shadow-md space-y-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-linear-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-sm">
                      <TrendingUp className="h-3.5 w-3.5 text-white" />
                    </div>
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
                          <div className={`flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-full ${weekComparison.diff >= 0 ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600" : "bg-red-50 dark:bg-red-950/30 text-red-500"}`}>
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
                </div>

                {/* Recursos em vídeo */}
                <div className="bg-card border border-border/40 rounded-2xl shadow-md overflow-hidden">
                  <div className="h-1 w-full bg-linear-to-r from-violet-500 via-indigo-500 to-sky-500" />
                  <div className="p-4 pb-3 flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-linear-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-sm">
                      <Brain className="h-3.5 w-3.5 text-white" />
                    </div>
                    <p className="text-sm font-black text-foreground">Recursos em Vídeo</p>
                  </div>
                  <div className="px-3 pb-3 space-y-1.5">
                    {[
                      { id: "WslQPnj6RHs", title: "Grounding 5-4-3-2-1", desc: "Técnica de ancoragem sensorial", gradient: "from-teal-500 to-cyan-600", icon: Wind },
                      { id: "kiEmbhvv7Fo", title: "Respiração em Caixa", desc: "4s inhale · 4s hold · 4s exhale", gradient: "from-sky-400 to-blue-600", icon: Wind },
                      { id: "S9p8j-QnICo", title: "Varredura Corporal", desc: "Relaxamento muscular progressivo", gradient: "from-violet-500 to-purple-600", icon: Brain },
                      { id: "zwc9rRB__Wo", title: "Meditação da Compaixão", desc: "Cultivar amor e bondade", gradient: "from-rose-500 to-pink-600", icon: HeartPulse },
                      { id: "fmBRuuQ0Gs8", title: "Meditação de 5 Minutos", desc: "Mindfulness rápido para o dia a dia", gradient: "from-amber-400 to-orange-500", icon: Sparkles },
                      { id: "pRgzG9PGkHw", title: "Meditação de Visualização", desc: "Imaginação guiada para relaxar", gradient: "from-indigo-500 to-violet-600", icon: Brain },
                    ].map((v) => (
                      <motion.button
                        key={v.id}
                        whileHover={{ x: 3 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setVideoId(v.id)}
                        className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/60 transition-colors text-left group"
                      >
                        <div className={`shrink-0 w-8 h-8 rounded-lg bg-linear-to-br ${v.gradient} flex items-center justify-center shadow-sm`}>
                          <v.icon className="h-3.5 w-3.5 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-black text-foreground truncate leading-tight">{v.title}</p>
                          <p className="text-[10px] text-muted-foreground font-medium truncate">{v.desc}</p>
                        </div>
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-primary transition-colors shrink-0" />
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Quote card */}
                <div className="relative rounded-2xl overflow-hidden p-6 text-white shadow-xl" style={{ background: "linear-gradient(135deg, oklch(0.18 0.05 268) 0%, oklch(0.22 0.07 280) 100%)" }}>
                  <div className="absolute top-0 right-0 w-24 h-24 rounded-full -mt-6 -mr-6 opacity-20" style={{ background: "oklch(0.50 0.22 268)", filter: "blur(24px)" }} />
                  <div className="relative z-10 space-y-3">
                    <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                      <HeartPulse className="h-4 w-4 text-pink-300" />
                    </div>
                    <p className="text-sm font-bold italic opacity-90 leading-relaxed">
                      "Seja gentil consigo mesmo nos dias difíceis."
                    </p>
                  </div>
                </div>

              </motion.div>
            </div>

            {/* ─── Dialogs ──────────────────────────────────────────────── */}
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
                    <h2 className="text-2xl font-black text-foreground tracking-tight">Incrível! {streakMilestone} dias seguidos!</h2>
                    <p className="text-muted-foreground font-semibold text-sm leading-relaxed">
                      Você está construindo um hábito poderoso de autoconhecimento. Continue assim!
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 border border-orange-200 rounded-full px-4 py-2 text-sm font-black">
                    <Flame className="h-4 w-4" /> {streakMilestone} dias de sequência
                  </div>
                  <Button className="w-full rounded-full bg-primary shadow-lg shadow-primary/20 font-bold" onClick={() => setStreakMilestone(null)}>
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