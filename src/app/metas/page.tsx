"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target, Plus, CheckCircle2, Circle, Trash2,
  Pencil, Check, X, Loader2, ListChecks, TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useGoals } from "@/hooks/useGoals";
import { toast } from "sonner";
import { getStoredTokens } from "@/lib/api/client";
import { useNotifications } from "@/lib/context/NotificationsContext";

/* ─── Sugestões rápidas de metas ─────────────────────────────────────────────── */
const SUGGESTIONS = [
  "Meditar 10 minutos por dia",
  "Dormir 8 horas por noite",
  "Caminhar 30 minutos diariamente",
  "Registrar humor todos os dias",
  "Reduzir o uso de redes sociais",
];

export default function MetasPage() {
  const { goals, loading, create, toggle, remove, update } = useGoals();
  const { refresh: refreshNotifications } = useNotifications();

  const [newTitle, setNewTitle] = React.useState("");
  const [creating, setCreating] = React.useState(false);
  const [filter, setFilter] = React.useState<"all" | "active" | "done">("all");
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editText, setEditText] = React.useState("");
  const [showSuggestions, setShowSuggestions] = React.useState(false);

  const isAuthenticated = !!getStoredTokens();
  const inputRef = React.useRef<HTMLInputElement>(null);

  const filtered = goals.filter((g) => {
    if (filter === "active") return !g.completed;
    if (filter === "done")   return g.completed;
    return true;
  });

  const activeCount = goals.filter((g) => !g.completed).length;
  const doneCount   = goals.filter((g) =>  g.completed).length;
  const pct = goals.length > 0 ? Math.round((doneCount / goals.length) * 100) : 0;

  const handleCreate = async (title?: string) => {
    const t = (title ?? newTitle).trim();
    if (!t) return;
    setCreating(true);
    try {
      await create(t);
      setNewTitle("");
      setShowSuggestions(false);
      toast.success("Meta criada! 🎯");
      setTimeout(refreshNotifications, 1200);
    } catch {
      toast.error("Erro ao criar meta.");
    } finally {
      setCreating(false);
    }
  };

  const handleToggle = async (id: string) => {
    const goal = goals.find(g => g.id === id);
    try {
      await toggle(id);
      if (!goal?.completed) {
        toast.success("Meta concluída! 🎉");
        setTimeout(refreshNotifications, 1200);
      }
    } catch {
      toast.error("Erro ao atualizar meta.");
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await remove(id);
      toast.success("Meta removida.");
    } catch {
      toast.error("Erro ao remover meta.");
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editText.trim()) return;
    try {
      await update(id, editText.trim());
      setEditingId(null);
      toast.success("Meta atualizada.");
    } catch {
      toast.error("Erro ao atualizar meta.");
    }
  };

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
  const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

  const FILTERS = [
    { key: "all",    label: "Todas",        count: goals.length  },
    { key: "active", label: "Em andamento", count: activeCount   },
    { key: "done",   label: "Concluídas",   count: doneCount     },
  ] as const;

  return (
    <AppShell>
      <motion.div variants={container} initial="hidden" animate="show" className="max-w-2xl mx-auto space-y-6 pb-14">

        {/* ── Header ────────────────────────────────────────────────────────── */}
        <motion.div variants={fadeUp}>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Target className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-foreground">Minhas Metas</h1>
          </div>
          <p className="text-sm text-muted-foreground ml-13">
            Defina objetivos de bem-estar e acompanhe seu progresso.
          </p>
        </motion.div>

        {/* ── Stats + progresso geral ────────────────────────────────────────── */}
        <motion.div variants={fadeUp} className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Total",         value: goals.length, gradient: "from-slate-500 to-gray-600",   light: "bg-slate-50 dark:bg-slate-950/20",   border: "border-slate-200/60 dark:border-slate-800/30",   num: "text-slate-700 dark:text-slate-300", icon: ListChecks  },
              { label: "Em andamento",  value: activeCount,  gradient: "from-indigo-500 to-violet-500", light: "bg-indigo-50 dark:bg-indigo-950/20", border: "border-indigo-200/60 dark:border-indigo-800/30", num: "text-indigo-700 dark:text-indigo-300", icon: TrendingUp },
              { label: "Concluídas",    value: doneCount,    gradient: "from-emerald-500 to-teal-500",  light: "bg-emerald-50 dark:bg-emerald-950/20", border: "border-emerald-200/60 dark:border-emerald-800/30", num: "text-emerald-700 dark:text-emerald-300", icon: CheckCircle2 },
            ].map((s) => (
              <div key={s.label} className={cn("rounded-2xl border p-4 space-y-3", s.light, s.border)}>
                <div className={cn("w-8 h-8 rounded-xl bg-linear-to-br flex items-center justify-center shadow-sm", s.gradient)}>
                  <s.icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className={cn("text-2xl font-black", s.num)}>{s.value}</p>
                  <p className="text-xs font-semibold text-muted-foreground mt-0.5">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Barra de progresso geral */}
          {goals.length > 0 && (
            <div className="rounded-2xl border border-border/50 bg-card p-4 space-y-2 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-foreground">Progresso geral</p>
                <p className="text-xs font-black text-emerald-600">{pct}%</p>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-linear-to-r from-emerald-500 to-teal-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground font-medium">{doneCount} de {goals.length} metas concluídas</p>
            </div>
          )}
        </motion.div>

        {/* ── Formulário de nova meta ────────────────────────────────────────── */}
        {isAuthenticated && (
          <motion.div variants={fadeUp}>
            <div className="rounded-3xl border border-border/50 bg-card shadow-sm">
              <div className="px-5 py-4 border-b border-border/40">
                <p className="text-sm font-black text-foreground">Nova meta</p>
                <p className="text-xs text-muted-foreground mt-0.5">O que você quer alcançar?</p>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex gap-2">
                  <div className="relative flex-1 min-w-0">
                    <input
                      ref={inputRef}
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      onFocus={() => setShowSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                      onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); if (e.key === "Escape") setShowSuggestions(false); }}
                      placeholder="ex: Meditar 10 minutos por dia…"
                      disabled={creating}
                      className="w-full h-11 px-4 rounded-xl border border-border/60 bg-muted/40 text-sm font-medium placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400/50 transition-all disabled:opacity-40"
                    />
                    {/* Sugestões */}
                    <AnimatePresence>
                      {showSuggestions && newTitle === "" && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.15 }}
                          className="absolute top-full left-0 mt-1.5 rounded-2xl border border-border/50 bg-card shadow-lg z-50 overflow-hidden w-72 max-w-[90vw]"
                        >
                          <p className="px-3 pt-2.5 pb-1 text-[10px] font-black uppercase tracking-wider text-muted-foreground/60">Sugestões</p>
                          {SUGGESTIONS.map((s) => (
                            <button
                              key={s}
                              onMouseDown={() => handleCreate(s)}
                              className="w-full text-left px-3 py-2 text-xs font-medium text-foreground hover:bg-muted/50 transition-colors flex items-center gap-2"
                            >
                              <span className="w-1 h-1 rounded-full bg-emerald-400 shrink-0" />
                              {s}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <button
                    onClick={() => handleCreate()}
                    disabled={creating || !newTitle.trim()}
                    className="h-11 px-5 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-500/25 hover:opacity-90 transition-opacity disabled:opacity-30 shrink-0"
                  >
                    {creating
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <><Plus className="w-3.5 h-3.5" /> Adicionar</>
                    }
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Filtros ────────────────────────────────────────────────────────── */}
        <motion.div variants={fadeUp} className="flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={cn(
                "flex items-center gap-1.5 px-4 h-9 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0",
                filter === key
                  ? "bg-linear-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20"
                  : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
            >
              {label}
              <span className={cn(
                "text-[10px] font-black px-1.5 py-0.5 rounded-full",
                filter === key ? "bg-white/20 text-white" : "bg-muted-foreground/10 text-muted-foreground",
              )}>
                {count}
              </span>
            </button>
          ))}
        </motion.div>

        {/* ── Lista de metas ─────────────────────────────────────────────────── */}
        <motion.div variants={fadeUp} className="space-y-2">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 rounded-2xl bg-muted/30 animate-pulse" />
            ))
          ) : !isAuthenticated ? (
            <div className="rounded-3xl border border-border/50 bg-card p-12 text-center shadow-sm space-y-3">
              <div className="w-14 h-14 rounded-3xl bg-muted/50 flex items-center justify-center mx-auto">
                <Target className="w-7 h-7 text-muted-foreground/30" />
              </div>
              <p className="text-sm font-bold text-muted-foreground">Faça login para criar e ver suas metas.</p>
            </div>
          ) : filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-3xl border border-dashed border-border/60 bg-muted/10 p-12 text-center space-y-3"
            >
              <div className="w-14 h-14 rounded-3xl bg-muted/50 flex items-center justify-center mx-auto">
                <Target className="w-7 h-7 text-muted-foreground/30" />
              </div>
              <p className="text-sm font-bold text-muted-foreground">
                {filter === "done"
                  ? "Nenhuma meta concluída ainda. Continue se esforçando! 💪"
                  : filter === "active"
                  ? "Nenhuma meta em andamento."
                  : "Nenhuma meta criada ainda.\nAdicione sua primeira meta acima!"}
              </p>
            </motion.div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filtered.map((goal) => (
                <motion.div
                  key={goal.id}
                  layout
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -24, scale: 0.96, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.3 }}
                >
                  <div className={cn(
                    "rounded-2xl border transition-all overflow-hidden",
                    goal.completed
                      ? "bg-muted/20 border-border/30"
                      : "bg-card border-border/50 shadow-sm hover:shadow-md hover:border-border",
                  )}>
                    {/* Colored left strip */}
                    <div className={cn(
                      "flex items-center gap-3 px-4 py-3.5",
                      goal.completed && "opacity-60",
                    )}>
                      {/* Toggle */}
                      <button
                        onClick={() => handleToggle(goal.id)}
                        className="shrink-0 transition-all hover:scale-110"
                      >
                        {goal.completed
                          ? <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                          : <Circle className="w-6 h-6 text-muted-foreground/40 hover:text-emerald-500 transition-colors" />
                        }
                      </button>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {editingId === goal.id ? (
                          <div className="flex gap-2 items-center">
                            <input
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleUpdate(goal.id);
                                if (e.key === "Escape") setEditingId(null);
                              }}
                              autoFocus
                              className="flex-1 h-8 px-3 rounded-lg text-sm bg-muted/50 border border-border/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400/50 transition-all"
                            />
                            <button onClick={() => handleUpdate(goal.id)} className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center hover:bg-emerald-200 transition-colors">
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => setEditingId(null)} className="w-7 h-7 rounded-lg bg-muted text-muted-foreground flex items-center justify-center hover:bg-muted/80 transition-colors">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <p className={cn(
                              "text-sm font-bold truncate",
                              goal.completed ? "line-through text-muted-foreground" : "text-foreground",
                            )}>
                              {goal.title}
                            </p>
                            {goal.targetDate && (
                              <p className="text-[11px] text-muted-foreground/50 mt-0.5">
                                Prazo: {new Date(goal.targetDate).toLocaleDateString("pt-BR")}
                              </p>
                            )}
                          </>
                        )}
                      </div>

                      {/* Actions */}
                      {editingId !== goal.id && (
                        <div className="flex items-center gap-1 shrink-0">
                          {goal.completed && (
                            <span className="text-[10px] font-black text-emerald-600 bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 rounded-full mr-1">
                              ✓ Feita
                            </span>
                          )}
                          <button
                            onClick={() => { setEditingId(goal.id); setEditText(goal.title); }}
                            className="w-7 h-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 flex items-center justify-center transition-all"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleRemove(goal.id)}
                            className="w-7 h-7 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 flex items-center justify-center transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </motion.div>

      </motion.div>
    </AppShell>
  );
}