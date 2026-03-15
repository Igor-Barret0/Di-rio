"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, User, Mail, Calendar, Shield, Activity,
  Brain, BookHeart, Target, MessageSquare, CheckCircle2,
  AlertTriangle, ChevronDown, Loader2, UserCheck, UserX,
  Trash2, Zap, Flame, TrendingUp, FileText, Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api/client";
import { toast } from "sonner";
import { ConfirmModal } from "@/components/shared/ConfirmModal";

/* ─── Types ─────────────────────────────────────────────────── */
interface UserProfile { school?: string; grade?: string; bio?: string; xp: number; streak: number; longestStreak: number; }
interface Badge { id: string; name: string; icon: string; description: string; }
interface UserBadge { id: string; unlockedAt: string; badge: Badge; }
interface MoodRecord { id: string; mood: string; energy: number; note?: string; dateISO: string; createdAt: string; }
interface Assessment { id: string; type: "PHQ9" | "GAD7"; score: number; riskLevel: "NONE" | "LOW" | "MEDIUM" | "HIGH"; interpretation?: string; createdAt: string; }
interface Goal { id: string; title: string; description?: string; status: string; progress: number; deadline?: string; createdAt: string; }
interface AdminUserDetail {
  id: string; name: string; email: string; role: "STUDENT" | "COUNSELOR" | "ADMIN"; plan: "FREE" | "PRO";
  isActive: boolean; createdAt: string; profile?: UserProfile; userBadges: UserBadge[];
  _count: { moodRecords: number; assessments: number; goals: number; conversations: number };
  recentMoods: MoodRecord[]; recentAssessments: Assessment[]; goals: Goal[];
}

/* ─── Config ─────────────────────────────────────────────────── */
const MOOD_CONFIG: Record<string, { emoji: string; label: string; color: string; bg: string; border: string; gradient: string }> = {
  happy:   { emoji: "🙂", label: "Feliz",    color: "text-emerald-700", bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200/60", gradient: "from-emerald-500 to-teal-500" },
  neutral: { emoji: "😐", label: "Normal",   color: "text-blue-700",    bg: "bg-blue-50 dark:bg-blue-950/30",       border: "border-blue-200/60",    gradient: "from-blue-500 to-indigo-500" },
  sad:     { emoji: "😔", label: "Triste",   color: "text-violet-700",  bg: "bg-violet-50 dark:bg-violet-950/30",   border: "border-violet-200/60",  gradient: "from-violet-500 to-purple-500" },
  anxious: { emoji: "😰", label: "Ansioso",  color: "text-orange-700",  bg: "bg-orange-50 dark:bg-orange-950/30",   border: "border-orange-200/60",  gradient: "from-orange-500 to-amber-500" },
  angry:   { emoji: "😠", label: "Irritado", color: "text-red-700",     bg: "bg-red-50 dark:bg-red-950/30",         border: "border-red-200/60",     gradient: "from-red-500 to-rose-500" },
  excited: { emoji: "😄", label: "Animado",  color: "text-yellow-700",  bg: "bg-yellow-50 dark:bg-yellow-950/30",   border: "border-yellow-200/60",  gradient: "from-yellow-500 to-amber-400" },
  tired:   { emoji: "😴", label: "Cansado",  color: "text-slate-700",   bg: "bg-slate-50 dark:bg-slate-950/30",     border: "border-slate-200/60",   gradient: "from-slate-500 to-gray-500" },
};

const RISK_CONFIG = {
  NONE:   { label: "Mínimo",   color: "text-emerald-700", bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200/60", icon: CheckCircle2, bar: "bg-emerald-500" },
  LOW:    { label: "Leve",     color: "text-amber-700",   bg: "bg-amber-50 dark:bg-amber-950/30",     border: "border-amber-200/60",   icon: AlertTriangle, bar: "bg-amber-500" },
  MEDIUM: { label: "Moderado", color: "text-orange-700",  bg: "bg-orange-50 dark:bg-orange-950/30",   border: "border-orange-200/60",  icon: AlertTriangle, bar: "bg-orange-500" },
  HIGH:   { label: "Severo",   color: "text-rose-700",    bg: "bg-rose-50 dark:bg-rose-950/30",       border: "border-rose-200/60",    icon: AlertTriangle, bar: "bg-rose-500" },
};

const ROLE_CONFIG = {
  STUDENT:   { label: "Estudante",   color: "text-indigo-700", bg: "bg-indigo-50 dark:bg-indigo-950/30" },
  COUNSELOR: { label: "Conselheiro", color: "text-violet-700", bg: "bg-violet-50 dark:bg-violet-950/30" },
  ADMIN:     { label: "Admin",       color: "text-rose-700",   bg: "bg-rose-50 dark:bg-rose-950/30" },
};

const GOAL_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  ACTIVE:    { label: "Em andamento", color: "text-blue-700",    bg: "bg-blue-50 dark:bg-blue-950/30" },
  COMPLETED: { label: "Concluída",    color: "text-emerald-700", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
  ABANDONED: { label: "Abandonada",   color: "text-slate-500",   bg: "bg-slate-50 dark:bg-slate-950/20" },
};

const TABS = [
  { id: "overview",    label: "Visão Geral",  icon: User },
  { id: "humores",     label: "Humores",      icon: Activity },
  { id: "avaliacoes",  label: "Avaliações",   icon: Brain },
  { id: "metas",       label: "Metas",        icon: Target },
  { id: "conquistas",  label: "Conquistas",   icon: Shield },
];

/* ─── Energy dots ────────────────────────────────────────────── */
function EnergyDots({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <div key={i} className={cn("w-2 h-2 rounded-full", i <= value ? "bg-amber-400" : "bg-muted/30")} />
      ))}
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────── */
export function AdminUserDetailClient() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const router = useRouter();

  const [user, setUser] = React.useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [updating, setUpdating] = React.useState(false);
  const [tab, setTab] = React.useState("overview");
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  React.useEffect(() => {
    apiFetch<AdminUserDetail>(`/admin/users/${id}`)
      .then(setUser)
      .catch(() => toast.error("Erro ao carregar usuário."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleToggleActive = async () => {
    if (!user) return;
    setUpdating(true);
    try {
      await apiFetch(`/admin/users/${id}`, { method: "PATCH", body: JSON.stringify({ isActive: !user.isActive }) });
      setUser(u => u ? { ...u, isActive: !u.isActive } : u);
      toast.success(user.isActive ? "Usuário desativado." : "Usuário ativado.");
    } catch { toast.error("Erro ao atualizar."); }
    finally { setUpdating(false); }
  };

  const handleRoleChange = async (role: string) => {
    if (!user) return;
    setUpdating(true);
    try {
      await apiFetch(`/admin/users/${id}`, { method: "PATCH", body: JSON.stringify({ role }) });
      setUser(u => u ? { ...u, role: role as AdminUserDetail["role"] } : u);
      toast.success("Papel atualizado.");
    } catch { toast.error("Erro ao atualizar papel."); }
    finally { setUpdating(false); }
  };

  const handleDelete = () => setConfirmDelete(true);

  const doDelete = async () => {
    if (!user) return;
    setDeleting(true);
    try {
      await apiFetch(`/admin/users/${id}`, { method: "DELETE" });
      toast.success("Usuário excluído.");
      router.push("/admin/usuarios");
    } catch { toast.error("Erro ao excluir."); }
    finally { setDeleting(false); }
  };

  if (loading) return (
    <div className="space-y-4 animate-pulse pb-12">
      <div className="h-10 w-56 bg-muted/30 rounded-2xl" />
      <div className="h-36 bg-muted/20 rounded-3xl" />
      <div className="h-14 bg-muted/10 rounded-2xl" />
      <div className="grid md:grid-cols-4 gap-3">
        {[...Array(4)].map((_,i) => <div key={i} className="h-28 bg-muted/20 rounded-2xl" />)}
      </div>
    </div>
  );

  if (!user) return (
    <div className="flex flex-col items-center justify-center py-24 gap-3">
      <User className="h-10 w-10 text-muted-foreground/20" />
      <p className="text-sm font-bold text-muted-foreground">Usuário não encontrado.</p>
      <Link href="/admin/usuarios" className="text-sm text-primary font-bold hover:underline">Voltar</Link>
    </div>
  );

  const roleConf = ROLE_CONFIG[user.role];
  const initials = user.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="space-y-5 pb-14">

      {/* ── Top bar ── */}
      <div className="flex items-center gap-3">
        <Link href="/admin/usuarios" className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-2xl font-black tracking-tight text-foreground flex-1 truncate">{user.name}</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleActive} disabled={updating}
            className={cn(
              "flex items-center gap-1.5 text-xs font-black px-3 py-1.5 rounded-xl transition-colors border",
              user.isActive
                ? "text-emerald-700 bg-emerald-50 border-emerald-200/60 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-800/30"
                : "text-rose-700 bg-rose-50 border-rose-200/60 hover:bg-rose-100 dark:bg-rose-950/30 dark:border-rose-800/30",
            )}
          >
            {updating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : user.isActive ? <UserCheck className="h-3.5 w-3.5" /> : <UserX className="h-3.5 w-3.5" />}
            {user.isActive ? "Ativo" : "Inativo"}
          </button>
          <button onClick={handleDelete} title="Excluir usuário"
            className="p-2 rounded-xl text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all border border-transparent hover:border-rose-200/60">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── Hero card ── */}
      <div className="rounded-3xl border border-border/50 bg-card overflow-hidden shadow-sm">
        {/* gradient strip */}
        <div className="h-1.5 w-full bg-linear-to-r from-indigo-500 via-violet-500 to-purple-500" />
        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-5">
            {/* Avatar + info */}
            <div className="flex items-start gap-4 flex-1">
              <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xl font-black shadow-lg shadow-indigo-500/20 shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0 space-y-1.5">
                <h2 className="text-xl font-black text-foreground">{user.name}</h2>
                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 shrink-0" /> {user.email}
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 shrink-0" />
                  Cadastrado em {new Date(user.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
                </p>
                {user.profile?.school && (
                  <p className="text-xs text-muted-foreground">🏫 {user.profile.school}{user.profile.grade ? ` · ${user.profile.grade}` : ""}</p>
                )}
                {user.profile?.bio && (
                  <p className="text-xs text-muted-foreground/70 italic line-clamp-2">"{user.profile.bio}"</p>
                )}
              </div>
            </div>

            {/* Right side: role + xp + streak */}
            <div className="flex flex-col gap-3 sm:items-end sm:min-w-48">
              {/* Role selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground">Papel:</span>
                <div className="relative flex items-center">
                  <select
                    value={user.role}
                    onChange={e => handleRoleChange(e.target.value)}
                    disabled={updating}
                    className={cn("text-xs font-black px-2.5 py-1.5 rounded-lg border appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 pr-6", roleConf.bg, roleConf.color, "border-current/20")}
                  >
                    <option value="STUDENT">Estudante</option>
                    <option value="COUNSELOR">Conselheiro</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                  <ChevronDown className="absolute right-1.5 h-3 w-3 pointer-events-none opacity-50" />
                </div>
              </div>
              {/* Plan */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground">Plano:</span>
                <span className={cn("text-xs font-black px-2.5 py-1 rounded-lg border", user.plan === "PRO" ? "bg-indigo-50 text-indigo-700 border-indigo-200/60 dark:bg-indigo-950/30 dark:border-indigo-800/30" : "bg-muted/40 text-muted-foreground border-border/40")}>
                  {user.plan}
                </span>
              </div>
              {/* XP + Streak */}
              {user.profile && (
                <div className="flex items-center gap-3 pt-1 border-t border-border/40 w-full sm:w-auto">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-md bg-violet-100 dark:bg-violet-950/30 flex items-center justify-center">
                      <Zap className="h-3 w-3 text-violet-600" />
                    </div>
                    <span className="text-xs font-black text-foreground">{user.profile.xp}</span>
                    <span className="text-[10px] text-muted-foreground font-medium">XP</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-md bg-orange-100 dark:bg-orange-950/30 flex items-center justify-center">
                      <Flame className="h-3 w-3 text-orange-500" />
                    </div>
                    <span className="text-xs font-black text-foreground">{user.profile.streak}</span>
                    <span className="text-[10px] text-muted-foreground font-medium">dias</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-md bg-amber-100 dark:bg-amber-950/30 flex items-center justify-center">
                      <Star className="h-3 w-3 text-amber-500" />
                    </div>
                    <span className="text-xs font-black text-foreground">{user.profile.longestStreak}</span>
                    <span className="text-[10px] text-muted-foreground font-medium">recorde</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: BookHeart,    label: "Humores",    value: user._count.moodRecords,  gradient: "from-indigo-500 to-violet-500",  light: "bg-indigo-50 dark:bg-indigo-950/30" },
          { icon: Brain,        label: "Avaliações", value: user._count.assessments,  gradient: "from-violet-500 to-purple-500",  light: "bg-violet-50 dark:bg-violet-950/30" },
          { icon: Target,       label: "Metas",      value: user._count.goals,        gradient: "from-amber-500 to-orange-500",   light: "bg-amber-50 dark:bg-amber-950/30" },
          { icon: MessageSquare,label: "Conversas",  value: user._count.conversations,gradient: "from-teal-500 to-emerald-500",   light: "bg-teal-50 dark:bg-teal-950/30" },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="rounded-2xl border border-border/50 bg-card p-4 shadow-sm"
          >
            <div className={cn("w-9 h-9 rounded-xl bg-linear-to-br flex items-center justify-center mb-3 shadow-sm", s.gradient)}>
              <s.icon className="h-4 w-4 text-white" />
            </div>
            <p className="text-2xl font-black text-foreground">{s.value}</p>
            <p className="text-[11px] font-semibold text-muted-foreground mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div className="border-b border-border/50">
        <div className="flex gap-1 overflow-x-auto scrollbar-none">
          {TABS.map(t => {
            const count =
              t.id === "humores"    ? user._count.moodRecords :
              t.id === "avaliacoes" ? user._count.assessments :
              t.id === "metas"      ? user._count.goals :
              t.id === "conquistas" ? user.userBadges.length : null;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition-colors",
                  tab === t.id
                    ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                <t.icon className="h-3.5 w-3.5" />
                {t.label}
                {count !== null && count > 0 && (
                  <span className={cn("ml-0.5 min-w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center px-1",
                    tab === t.id ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-950/40" : "bg-muted/60 text-muted-foreground"
                  )}>{count}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Tab content ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
        >

          {/* OVERVIEW */}
          {tab === "overview" && (
            <div className="grid md:grid-cols-2 gap-4">
              {/* Mood distribution */}
              <div className="rounded-2xl border border-border/50 bg-card p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950/30 flex items-center justify-center">
                    <TrendingUp className="h-3.5 w-3.5 text-indigo-600" />
                  </div>
                  <h3 className="text-sm font-black text-foreground">Distribuição de Humores</h3>
                </div>
                {user.recentMoods.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-6 text-center">Nenhum registro ainda.</p>
                ) : (
                  <div className="space-y-2">
                    {Object.entries(
                      user.recentMoods.reduce((acc, m) => ({ ...acc, [m.mood]: (acc[m.mood] ?? 0) + 1 }), {} as Record<string, number>)
                    ).sort((a, b) => b[1] - a[1]).map(([mood, count]) => {
                      const mc = MOOD_CONFIG[mood] ?? { emoji: "❓", label: mood, gradient: "from-slate-400 to-slate-500" };
                      const pct = Math.round((count / user.recentMoods.length) * 100);
                      return (
                        <div key={mood} className="flex items-center gap-2.5">
                          <span className="text-base w-6 text-center">{mc.emoji}</span>
                          <span className="text-xs font-semibold text-foreground w-16 shrink-0">{mc.label}</span>
                          <div className="flex-1 h-2 rounded-full bg-muted/30 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.6, ease: "easeOut" }}
                              className={cn("h-full rounded-full bg-linear-to-r", mc.gradient)}
                            />
                          </div>
                          <span className="text-[11px] font-black text-muted-foreground w-8 text-right">{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              {/* Latest assessment summary */}
              <div className="rounded-2xl border border-border/50 bg-card p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-violet-100 dark:bg-violet-950/30 flex items-center justify-center">
                    <Brain className="h-3.5 w-3.5 text-violet-600" />
                  </div>
                  <h3 className="text-sm font-black text-foreground">Última Avaliação</h3>
                </div>
                {user.recentAssessments.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-6 text-center">Nenhuma avaliação ainda.</p>
                ) : (() => {
                  const a = user.recentAssessments[0];
                  const risk = RISK_CONFIG[a.riskLevel];
                  const Icon = risk.icon;
                  const maxScore = a.type === "PHQ9" ? 27 : 21;
                  const pct = Math.round((a.score / maxScore) * 100);
                  return (
                    <div className="space-y-4">
                      <div className={cn("flex items-center gap-3 px-4 py-3 rounded-2xl border", risk.bg, risk.border)}>
                        <Icon className={cn("h-5 w-5 shrink-0", risk.color)} />
                        <div className="flex-1">
                          <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">{a.type === "PHQ9" ? "PHQ-9 · Depressão" : "GAD-7 · Ansiedade"}</p>
                          <p className={cn("text-lg font-black", risk.color)}>{a.score}<span className="text-xs font-semibold text-muted-foreground">/{maxScore}</span></p>
                          <p className={cn("text-xs font-bold", risk.color)}>{risk.label}</p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-muted-foreground font-medium">
                          <span>Pontuação</span><span>{pct}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.7 }} className={cn("h-full rounded-full", risk.bar)} />
                        </div>
                      </div>
                      {a.interpretation && <p className="text-xs text-muted-foreground leading-relaxed">{a.interpretation}</p>}
                      <p className="text-[11px] text-muted-foreground">{new Date(a.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}</p>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* HUMORES */}
          {tab === "humores" && (
            <div className="space-y-2">
              {user.recentMoods.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Activity className="h-10 w-10 text-muted-foreground/20" />
                  <p className="text-sm text-muted-foreground font-medium">Nenhum humor registrado.</p>
                </div>
              ) : user.recentMoods.map((m, i) => {
                const mc = MOOD_CONFIG[m.mood] ?? { emoji: "❓", label: m.mood, color: "text-muted-foreground", bg: "bg-muted/20", border: "border-border/40", gradient: "from-slate-400 to-slate-500" };
                return (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={cn("rounded-2xl border p-4 flex items-start gap-4", mc.bg, mc.border)}
                  >
                    <span className="text-2xl shrink-0 mt-0.5">{mc.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={cn("text-sm font-black", mc.color)}>{mc.label}</p>
                        <EnergyDots value={m.energy} />
                        <span className="text-[10px] text-muted-foreground font-medium">energia {m.energy}/5</span>
                      </div>
                      {m.note && (
                        <div className="mt-2 flex items-start gap-1.5">
                          <FileText className="h-3 w-3 text-muted-foreground/50 shrink-0 mt-0.5" />
                          <p className="text-xs text-foreground/80 leading-relaxed italic">"{m.note}"</p>
                        </div>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-foreground/70">
                        {new Date(m.dateISO).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {new Date(m.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* AVALIAÇÕES */}
          {tab === "avaliacoes" && (
            <div className="space-y-3">
              {user.recentAssessments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Brain className="h-10 w-10 text-muted-foreground/20" />
                  <p className="text-sm text-muted-foreground font-medium">Nenhuma avaliação realizada.</p>
                </div>
              ) : user.recentAssessments.map((a, i) => {
                const risk = RISK_CONFIG[a.riskLevel];
                const Icon = risk.icon;
                const maxScore = a.type === "PHQ9" ? 27 : 21;
                const pct = Math.round((a.score / maxScore) * 100);
                return (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={cn("rounded-2xl border p-5 space-y-3", risk.bg, risk.border)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", risk.bg, "border", risk.border)}>
                          <Icon className={cn("h-5 w-5", risk.color)} />
                        </div>
                        <div>
                          <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">
                            {a.type === "PHQ9" ? "PHQ-9 · Depressão" : "GAD-7 · Ansiedade"}
                          </p>
                          <p className={cn("text-xl font-black", risk.color)}>
                            {a.score}<span className="text-sm font-semibold text-muted-foreground">/{maxScore}</span>
                            <span className={cn("ml-2 text-sm font-black", risk.color)}>— {risk.label}</span>
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground font-medium shrink-0">
                        {new Date(a.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <div className="h-2.5 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: "easeOut" }} className={cn("h-full rounded-full", risk.bar)} />
                      </div>
                      <p className={cn("text-[11px] font-bold", risk.color)}>{pct}% da pontuação máxima</p>
                    </div>
                    {a.interpretation && (
                      <p className="text-xs text-foreground/70 leading-relaxed border-t border-black/5 dark:border-white/5 pt-2">{a.interpretation}</p>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* METAS */}
          {tab === "metas" && (
            <div className="space-y-2">
              {user.goals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Target className="h-10 w-10 text-muted-foreground/20" />
                  <p className="text-sm text-muted-foreground font-medium">Nenhuma meta criada.</p>
                </div>
              ) : user.goals.map((g, i) => {
                const status = GOAL_STATUS[g.status] ?? { label: g.status, color: "text-muted-foreground", bg: "bg-muted/20" };
                return (
                  <motion.div
                    key={g.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="rounded-2xl border border-border/50 bg-card p-4 space-y-3 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-foreground">{g.title}</p>
                        {g.description && <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{g.description}</p>}
                      </div>
                      <span className={cn("text-[11px] font-black px-2.5 py-1 rounded-lg shrink-0", status.bg, status.color)}>
                        {status.label}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-muted-foreground font-medium">
                        <span>Progresso</span><span className="font-black text-foreground">{g.progress}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${g.progress}%` }}
                          transition={{ duration: 0.7 }}
                          className={cn("h-full rounded-full", g.status === "COMPLETED" ? "bg-emerald-500" : "bg-indigo-500")}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                      <span>Criada em {new Date(g.createdAt).toLocaleDateString("pt-BR")}</span>
                      {g.deadline && <span>· Prazo: {new Date(g.deadline).toLocaleDateString("pt-BR")}</span>}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* CONQUISTAS */}
          {tab === "conquistas" && (
            <div>
              {user.userBadges.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Shield className="h-10 w-10 text-muted-foreground/20" />
                  <p className="text-sm text-muted-foreground font-medium">Nenhuma conquista desbloqueada.</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {user.userBadges.map((ub, i) => (
                    <motion.div
                      key={ub.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="rounded-2xl border border-violet-200/60 dark:border-violet-800/30 bg-violet-50 dark:bg-violet-950/20 p-4 flex items-center gap-3"
                    >
                      <span className="text-3xl shrink-0">{ub.badge.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-violet-700 dark:text-violet-400">{ub.badge.name}</p>
                        <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">{ub.badge.description}</p>
                        <p className="text-[10px] text-muted-foreground/60 mt-1">
                          {new Date(ub.unlockedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

        </motion.div>
      </AnimatePresence>

      <ConfirmModal
        open={confirmDelete}
        title="Excluir conta"
        description={`Tem certeza que deseja excluir permanentemente a conta de ${user?.name}? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        loading={deleting}
        onClose={() => setConfirmDelete(false)}
        onConfirm={doDelete}
      />
    </div>
  );
}