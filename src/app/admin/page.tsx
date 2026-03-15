"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Users, BookHeart, ClipboardList, AlertTriangle,
  Activity, TrendingUp, ChevronRight, ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api/client";

const MOOD_CONFIG: Record<string, { label: string; emoji: string; gradient: string }> = {
  happy:   { label: "Feliz",    emoji: "🙂", gradient: "from-emerald-500 to-teal-500" },
  neutral: { label: "Normal",   emoji: "😐", gradient: "from-blue-500 to-indigo-500" },
  sad:     { label: "Triste",   emoji: "😔", gradient: "from-violet-500 to-purple-500" },
  anxious: { label: "Ansioso",  emoji: "😰", gradient: "from-orange-500 to-amber-500" },
  angry:   { label: "Irritado", emoji: "😠", gradient: "from-red-500 to-rose-500" },
  excited: { label: "Animado",  emoji: "😄", gradient: "from-yellow-500 to-amber-400" },
  tired:   { label: "Cansado",  emoji: "😴", gradient: "from-slate-500 to-gray-500" },
};

const RISK_CONFIG = {
  NONE:   { label: "Mínimo",   color: "text-emerald-700", bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200/60 dark:border-emerald-800/30" },
  LOW:    { label: "Leve",     color: "text-amber-700",   bg: "bg-amber-50 dark:bg-amber-950/30",     border: "border-amber-200/60 dark:border-amber-800/30" },
  MEDIUM: { label: "Moderado", color: "text-orange-700",  bg: "bg-orange-50 dark:bg-orange-950/30",   border: "border-orange-200/60 dark:border-orange-800/30" },
  HIGH:   { label: "Severo",   color: "text-rose-700",    bg: "bg-rose-50 dark:bg-rose-950/30",       border: "border-rose-200/60 dark:border-rose-800/30" },
};

interface GlobalStats {
  totalUsers: number; totalMoods: number; totalAssessments: number; highRiskCount: number;
  activeToday: number; moodFrequency: Record<string, number>;
  riskBreakdown: { riskLevel: string; count: number }[];
  roleBreakdown: { role: string; count: number }[];
  recentHighRisk: { id: string; type: string; score: number; riskLevel: string; createdAt: string; user: { id: string; name: string; email: string } }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = React.useState<GlobalStats | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    apiFetch<GlobalStats>("/admin/stats").then(setStats).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const totalMoods = stats ? Object.values(stats.moodFrequency).reduce((a, b) => a + b, 0) : 0;
  const today = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });

  const STATS = [
    { label: "Usuários",       value: stats?.totalUsers,      icon: Users,          gradient: "from-indigo-500 to-violet-600",  shadow: "shadow-indigo-500/20" },
    { label: "Humores",        value: stats?.totalMoods,       icon: BookHeart,      gradient: "from-violet-500 to-purple-600",  shadow: "shadow-violet-500/20" },
    { label: "Avaliações",     value: stats?.totalAssessments, icon: ClipboardList,  gradient: "from-amber-500 to-orange-500",   shadow: "shadow-amber-500/20" },
    { label: "Alto risco",     value: stats?.highRiskCount,    icon: AlertTriangle,  gradient: "from-rose-500 to-red-600",       shadow: "shadow-rose-500/20" },
  ];

  return (
    <div className="space-y-7 pb-14">

      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-foreground">Dashboard</h1>
            <p className="text-xs text-muted-foreground font-medium mt-0.5 capitalize">{today}</p>
          </div>
          {!loading && stats?.activeToday !== undefined && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/30">
              <Activity className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-xs font-black text-emerald-700">{stats.activeToday} hoje</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {STATS.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.4 }}
            className="rounded-2xl border border-border/50 bg-card p-4 shadow-sm"
          >
            <div className={cn("w-10 h-10 rounded-xl bg-linear-to-br flex items-center justify-center mb-3 shadow-md", s.gradient, s.shadow)}>
              <s.icon className="h-5 w-5 text-white" />
            </div>
            <p className="text-3xl font-black text-foreground tabular-nums">
              {loading ? <span className="inline-block w-8 h-7 bg-muted/30 rounded-lg animate-pulse" /> : (s.value ?? 0)}
            </p>
            <p className="text-[11px] font-semibold text-muted-foreground mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Main grid ── */}
      <div className="grid md:grid-cols-2 gap-5">

        {/* Mood distribution */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-2xl border border-border/50 bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm">
              <TrendingUp className="h-3.5 w-3.5 text-white" />
            </div>
            <h2 className="text-sm font-black text-foreground">Distribuição de Humores</h2>
            <span className="ml-auto text-[11px] font-semibold text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">{totalMoods} total</span>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_,i) => <div key={i} className="h-6 bg-muted/20 rounded-lg animate-pulse" />)}
            </div>
          ) : (
            <div className="space-y-2.5">
              {Object.entries(MOOD_CONFIG).map(([key, val]) => {
                const count = stats?.moodFrequency[key] ?? 0;
                const pct = totalMoods > 0 ? Math.round((count / totalMoods) * 100) : 0;
                return (
                  <div key={key} className="flex items-center gap-2.5">
                    <span className="text-sm w-5 text-center">{val.emoji}</span>
                    <span className="text-xs font-semibold text-foreground w-14 shrink-0">{val.label}</span>
                    <div className="flex-1 h-2 rounded-full bg-muted/25 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
                        className={cn("h-full rounded-full bg-linear-to-r", val.gradient)}
                      />
                    </div>
                    <span className="text-[11px] font-black text-muted-foreground w-12 text-right tabular-nums">
                      {count} <span className="font-medium opacity-60">({pct}%)</span>
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* High risk assessments */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="rounded-2xl border border-border/50 bg-card p-5 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg bg-linear-to-br from-rose-500 to-red-600 flex items-center justify-center shadow-sm">
              <AlertTriangle className="h-3.5 w-3.5 text-white" />
            </div>
            <h2 className="text-sm font-black text-foreground">Avaliações de Alto Risco</h2>
          </div>
          {loading ? (
            <div className="space-y-2 flex-1">
              {[...Array(3)].map((_,i) => <div key={i} className="h-14 bg-muted/20 rounded-xl animate-pulse" />)}
            </div>
          ) : !stats?.recentHighRisk.length ? (
            <div className="flex-1 flex flex-col items-center justify-center py-10 gap-2">
              <div className="w-12 h-12 rounded-2xl bg-muted/30 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-muted-foreground/30" />
              </div>
              <p className="text-xs font-semibold text-muted-foreground">Nenhum registro de alto risco.</p>
            </div>
          ) : (
            <div className="space-y-2 flex-1">
              {stats.recentHighRisk.map((a) => {
                const risk = RISK_CONFIG[a.riskLevel as keyof typeof RISK_CONFIG] ?? RISK_CONFIG.HIGH;
                return (
                  <Link
                    key={a.id}
                    href={`/admin/usuarios/${a.user.id}`}
                    className={cn("flex items-center gap-3 p-3 rounded-xl border transition-all hover:shadow-sm group", risk.bg, risk.border)}
                  >
                    <div className="h-8 w-8 rounded-lg bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center shrink-0">
                      <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-foreground truncate">{a.user.name}</p>
                      <p className="text-[10px] text-muted-foreground font-medium">
                        {a.type} · {new Date(a.createdAt).toLocaleDateString("pt-BR")} · <span className={risk.color}>{risk.label}</span>
                      </p>
                    </div>
                    <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-muted-foreground shrink-0 transition-colors" />
                  </Link>
                );
              })}
            </div>
          )}
          <Link href="/admin/usuarios" className="mt-4 pt-3 border-t border-border/40 flex items-center justify-center gap-1 text-xs font-bold text-primary hover:text-primary/80 transition-colors">
            Ver todos os usuários <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </motion.div>
      </div>

      {/* ── Role breakdown ── */}
      {!loading && stats?.roleBreakdown && stats.roleBreakdown.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-2xl border border-border/50 bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm">
              <Users className="h-3.5 w-3.5 text-white" />
            </div>
            <h2 className="text-sm font-black text-foreground">Distribuição por Papel</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {stats.roleBreakdown.map(rb => {
              const cfg = rb.role === "ADMIN" ? { label: "Admin", bg: "bg-rose-50 dark:bg-rose-950/30", color: "text-rose-700 dark:text-rose-400", border: "border-rose-200/60" }
                : rb.role === "COUNSELOR" ? { label: "Conselheiro", bg: "bg-violet-50 dark:bg-violet-950/30", color: "text-violet-700 dark:text-violet-400", border: "border-violet-200/60" }
                : { label: "Estudante", bg: "bg-indigo-50 dark:bg-indigo-950/30", color: "text-indigo-700 dark:text-indigo-400", border: "border-indigo-200/60" };
              return (
                <div key={rb.role} className={cn("flex items-center gap-2 px-4 py-2.5 rounded-xl border", cfg.bg, cfg.border)}>
                  <span className={cn("text-xl font-black tabular-nums", cfg.color)}>{rb.count}</span>
                  <span className={cn("text-xs font-semibold", cfg.color)}>{cfg.label}{rb.count !== 1 ? "s" : ""}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

    </div>
  );
}