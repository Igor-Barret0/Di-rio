"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useMoodRecords } from "@/hooks/useMoodRecords";
import { MOOD_OPTIONS } from "@/lib/moods/options";
import { AppShell } from "@/components/layout/AppShell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmotionChart } from "@/components/charts/EmotionChart";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar, History, TrendingUp, ChevronRight, ChevronLeft,
  Quote, Play, Pause, Trash2, BookOpen, Smile, Flame,
} from "lucide-react";
import { apiFetch, getStoredTokens } from "@/lib/api/client";
import { toast } from "sonner";
import { getCurrentStreak } from "@/lib/storage/moodStorage";

// ─── Mood config ──────────────────────────────────────────────────────────────
const MOOD_COLORS: Record<string, { bg: string; pill: string; dot: string; border: string; emoji: string; label: string }> = {
  happy:   { bg: "bg-emerald-400",  pill: "bg-emerald-100 text-emerald-700",  dot: "bg-emerald-400",  border: "border-l-emerald-400",  emoji: "🙂", label: "Feliz" },
  neutral: { bg: "bg-blue-400",     pill: "bg-blue-100 text-blue-700",        dot: "bg-blue-400",     border: "border-l-blue-400",     emoji: "😐", label: "Normal" },
  sad:     { bg: "bg-violet-400",   pill: "bg-violet-100 text-violet-700",    dot: "bg-violet-400",   border: "border-l-violet-400",   emoji: "😔", label: "Triste" },
  anxious: { bg: "bg-orange-400",   pill: "bg-orange-100 text-orange-700",    dot: "bg-orange-400",   border: "border-l-orange-400",   emoji: "😰", label: "Ansioso" },
};

// ─── AudioPlayer ──────────────────────────────────────────────────────────────
function formatTime(sec: number) {
  return `${Math.floor(sec / 60).toString().padStart(2, "0")}:${(sec % 60).toString().padStart(2, "0")}`;
}

function AudioPlayer({ audioBase64, durationSec = 0 }: { audioBase64: string; durationSec?: number }) {
  const [playing, setPlaying] = React.useState(false);
  const [pos, setPos] = React.useState(0);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const toggle = () => {
    if (playing && audioRef.current) { audioRef.current.pause(); setPlaying(false); return; }
    const audio = new Audio(`data:audio/webm;base64,${audioBase64}`);
    audioRef.current = audio;
    audio.play();
    setPlaying(true);
    const iv = setInterval(() => setPos(Math.floor(audio.currentTime)), 500);
    audio.onended = () => { clearInterval(iv); setPlaying(false); setPos(0); audioRef.current = null; };
  };

  React.useEffect(() => () => { audioRef.current?.pause(); }, []);
  const pct = durationSec > 0 ? Math.min(100, (pos / durationSec) * 100) : 0;

  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-primary/5 border border-primary/15">
      <button onClick={toggle} className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors shrink-0">
        {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 ml-0.5" />}
      </button>
      <div className="flex-1 h-1.5 bg-primary/10 rounded-full overflow-hidden">
        <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-bold text-primary/70 tabular-nums shrink-0">
        {playing ? formatTime(pos) : formatTime(durationSec)}
      </span>
    </div>
  );
}

// ─── Calendar ─────────────────────────────────────────────────────────────────
function toISO(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function MoodCalendar({ records }: { records: { dateISO: string; mood: string }[] }) {
  const recordMap = React.useMemo(() => {
    const m: Record<string, string> = {};
    records.forEach((r) => { m[r.dateISO] = r.mood; });
    return m;
  }, [records]);

  const today = new Date();
  const [year, setYear] = React.useState(today.getFullYear());
  const [month, setMonth] = React.useState(today.getMonth());

  const goBack = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const goForward = () => {
    if (year === today.getFullYear() && month === today.getMonth()) return;
    if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1);
  };

  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDow = new Date(year, month, 1).getDay();
  const monthLabel = new Date(year, month, 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  return (
    <div className="space-y-4">
      {/* Navegação */}
      <div className="flex items-center justify-between mb-2">
        <button onClick={goBack} className="w-8 h-8 rounded-xl hover:bg-muted flex items-center justify-center transition-colors">
          <ChevronLeft className="h-4 w-4 text-muted-foreground" />
        </button>
        <p className="text-sm font-black text-foreground capitalize tracking-tight">{monthLabel}</p>
        <button
          onClick={goForward}
          disabled={isCurrentMonth}
          className={cn("w-8 h-8 rounded-xl flex items-center justify-center transition-colors", isCurrentMonth ? "opacity-25 cursor-not-allowed" : "hover:bg-muted")}
        >
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* Cabeçalho semana */}
      <div className="grid grid-cols-7 mb-1">
        {weekDays.map((d) => (
          <div key={d} className="text-center text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest py-1">{d}</div>
        ))}
      </div>

      {/* Grid dias */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: startDow }).map((_, i) => <div key={`pad-${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
          const iso = toISO(year, month, day);
          const mood = recordMap[iso];
          const mc = mood ? MOOD_COLORS[mood] : null;
          const isToday = iso === toISO(today.getFullYear(), today.getMonth(), today.getDate());

          return (
            <div
              key={day}
              title={mc ? `${mc.label}` : iso}
              className={cn(
                "aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all text-center",
                mc ? mc.bg + " shadow-sm" : "bg-muted/40 hover:bg-muted/60",
                isToday && !mc && "ring-2 ring-primary ring-offset-1 bg-primary/8",
              )}
            >
              <span className={cn(
                "text-[10px] sm:text-[11px] font-black leading-none",
                mc ? "text-white" : isToday ? "text-primary" : "text-muted-foreground/50",
              )}>
                {day}
              </span>
              {mc && <span className="text-[9px] sm:text-xs leading-none">{mc.emoji}</span>}
            </div>
          );
        })}
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-3 border-t border-border/30">
        {Object.entries(MOOD_COLORS).map(([key, val]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className={cn("h-2.5 w-2.5 rounded-full", val.dot)} />
            <span className="text-[10px] font-bold text-muted-foreground">{val.label}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/20" />
          <span className="text-[10px] font-bold text-muted-foreground">Sem registro</span>
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function lastNDaysISO(n: number) {
  const out: string[] = [];
  const d = new Date();
  for (let i = 0; i < n; i++) {
    const dt = new Date(d);
    dt.setDate(d.getDate() - i);
    out.push(`${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`);
  }
  return out.reverse();
}

function SectionHeader({ icon: Icon, title, iconColor = "text-primary", iconBg = "bg-primary/10" }: {
  icon: React.ElementType; title: string; iconColor?: string; iconBg?: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className={cn("w-9 h-9 rounded-2xl flex items-center justify-center shadow-sm", iconBg)}>
        <Icon className={cn("h-4.5 w-4.5", iconColor)} />
      </div>
      <h2 className="text-xl font-black tracking-tight text-foreground">{title}</h2>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HistoricoPage() {
  const { records, loading, refresh } = useMoodRecords();
  const streak = React.useMemo(() => getCurrentStreak(records), [records]);

  const records7 = React.useMemo(() => {
    const days = new Set(lastNDaysISO(7));
    return records.filter((r) => days.has(r.dateISO));
  }, [records]);

  const records30 = React.useMemo(() => {
    const days = new Set(lastNDaysISO(30));
    return records.filter((r) => days.has(r.dateISO));
  }, [records]);

  const timeline = React.useMemo(() => [...records].sort((a, b) => (a.dateISO < b.dateISO ? 1 : -1)).slice(0, 20), [records]);

  const topMood = React.useMemo(() => {
    if (!records.length) return null;
    const freq: Record<string, number> = {};
    records.forEach((r) => { freq[r.mood] = (freq[r.mood] ?? 0) + 1; });
    return Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  }, [records]);

  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [moodStats, setMoodStats] = React.useState<{ total: number; frequency: Record<string, number> } | null>(null);

  React.useEffect(() => {
    if (!getStoredTokens()) return;
    apiFetch<{ total: number; frequency: Record<string, number> }>("/moods/stats").then(setMoodStats).catch(() => {});
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Apagar este registro permanentemente?")) return;
    try {
      if (getStoredTokens()) await apiFetch(`/moods/${id}`, { method: "DELETE" });
      await refresh();
      if (expandedId === id) setExpandedId(null);
      toast.success("Registro apagado.");
    } catch { toast.error("Erro ao apagar registro."); }
  };

  const iv = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
  const cv = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };

  return (
    <AppShell>
      <motion.div variants={cv} initial="hidden" animate="show" className="space-y-8 pb-14">

        {/* ── Hero ───────────────────────────────────────── */}
        <motion.div variants={iv}>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-400/25">
              <History className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-foreground">Sua Jornada</h1>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xl mt-2">
            Acompanhe a evolução dos seus sentimentos e descubra seus padrões emocionais ao longo do tempo.
          </p>
        </motion.div>

        {/* ── Stats rápidos ──────────────────────────────── */}
        <motion.div variants={iv} className="grid grid-cols-3 gap-3">
          {[
            {
              icon: BookOpen, label: "Registros", value: records.length,
              iconClass: "text-indigo-600", bgClass: "bg-indigo-50 dark:bg-indigo-950/30",
            },
            {
              icon: Flame, label: "Sequência", value: `${streak}d`,
              iconClass: "text-orange-500", bgClass: "bg-orange-50 dark:bg-orange-950/30",
            },
            {
              icon: Smile, label: "Humor comum",
              value: topMood ? MOOD_COLORS[topMood]?.emoji + " " + MOOD_COLORS[topMood]?.label : "—",
              iconClass: "text-emerald-600", bgClass: "bg-emerald-50 dark:bg-emerald-950/30",
            },
          ].map((s) => (
            <div key={s.label} className={cn("rounded-2xl p-4 space-y-2 border border-border/40 shadow-sm", s.bgClass)}>
              <s.icon className={cn("h-4 w-4", s.iconClass)} />
              <p className="text-xl font-black text-foreground leading-none">{s.value}</p>
              <p className="text-[11px] font-bold text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* ── Gráfico ────────────────────────────────────── */}
        <motion.div variants={iv}>
          <SectionHeader icon={TrendingUp} title="Evolução Emocional" iconColor="text-indigo-600" iconBg="bg-indigo-50 dark:bg-indigo-950/30" />
          <div className="bg-card rounded-3xl border border-border/50 shadow-sm p-6">
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-48 rounded-2xl" />
                <Skeleton className="h-64 w-full rounded-2xl" />
              </div>
            ) : (
              <Tabs defaultValue="7d">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <TabsList className="bg-muted/60 p-1 rounded-2xl h-10 w-fit">
                    <TabsTrigger value="7d" className="rounded-xl px-5 font-bold text-xs uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-sm">7 Dias</TabsTrigger>
                    <TabsTrigger value="30d" className="rounded-xl px-5 font-bold text-xs uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-sm">30 Dias</TabsTrigger>
                  </TabsList>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground">
                      <div className="w-2 h-2 rounded-full bg-primary" /> Tendência
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground">
                      <TrendingUp className="h-3 w-3 text-secondary" /> Evolução
                    </div>
                  </div>
                </div>
                <TabsContent value="7d" className="mt-0 focus-visible:outline-none">
                  <EmotionChart records={records7} height={280} />
                </TabsContent>
                <TabsContent value="30d" className="mt-0 focus-visible:outline-none">
                  <EmotionChart records={records30} height={280} />
                </TabsContent>
              </Tabs>
            )}
          </div>
        </motion.div>

        {/* ── Calendário ─────────────────────────────────── */}
        <motion.div variants={iv}>
          <SectionHeader icon={Calendar} title="Calendário Emocional" iconColor="text-violet-600" iconBg="bg-violet-50 dark:bg-violet-950/30" />
          <div className="bg-card rounded-3xl border border-border/50 shadow-sm p-5 sm:p-6 overflow-x-auto">
            <MoodCalendar records={records} />
          </div>
        </motion.div>

        {/* ── Resumo por humor ───────────────────────────── */}
        {(moodStats?.total ?? records.length) > 0 && (
          <motion.div variants={iv}>
            <SectionHeader icon={Smile} title="Resumo por Humor" iconColor="text-emerald-600" iconBg="bg-emerald-50 dark:bg-emerald-950/30" />
            <div className="bg-card rounded-3xl border border-border/50 shadow-sm p-5 sm:p-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(MOOD_COLORS).map(([key, val]) => {
                  const total = moodStats?.total ?? records.length;
                  const count = moodStats?.frequency?.[key] ?? records.filter(r => r.mood === key).length;
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                  return (
                    <div key={key} className="rounded-2xl border border-border/40 p-4 text-center space-y-2 hover:shadow-sm transition-shadow">
                      <span className="text-3xl block">{val.emoji}</span>
                      <p className="text-2xl font-black text-foreground leading-none">{pct}%</p>
                      <p className="text-xs font-bold text-muted-foreground">{val.label}</p>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className={cn("h-full rounded-full transition-all", val.bg)} style={{ width: `${pct}%` }} />
                      </div>
                      <p className="text-[10px] text-muted-foreground/60 font-medium">{count} {count === 1 ? "dia" : "dias"}</p>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/30">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total registrado</span>
                <span className="text-sm font-black text-foreground">{moodStats?.total ?? records.length} dias</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Registros Recentes ─────────────────────────── */}
        <motion.div variants={iv}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center shadow-sm">
                <BookOpen className="h-4.5 w-4.5 text-amber-600" />
              </div>
              <h2 className="text-xl font-black tracking-tight text-foreground">Registros Recentes</h2>
            </div>
            <span className="text-xs font-black text-primary uppercase tracking-widest">{records.length} total</span>
          </div>

          {timeline.length === 0 ? (
            <div className="bg-card rounded-3xl border border-border/50 shadow-sm p-12 text-center space-y-3">
              <Calendar className="h-10 w-10 text-muted-foreground/25 mx-auto" />
              <p className="text-sm font-bold text-muted-foreground">Nenhum registro ainda.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {timeline.map((r) => {
                const moodOpt = MOOD_OPTIONS.find(m => m.key === r.mood);
                const mc = MOOD_COLORS[r.mood];
                const isExpanded = expandedId === r.id;

                return (
                  <motion.div key={r.id} layout transition={{ type: "spring", stiffness: 300, damping: 30 }}>
                    <div
                      onClick={() => setExpandedId(isExpanded ? null : r.id)}
                      className={cn(
                        "cursor-pointer bg-card rounded-2xl border-l-4 border border-border/40 shadow-sm overflow-hidden transition-all hover:shadow-md",
                        mc?.border ?? "border-l-border",
                      )}
                    >
                      {/* Header do card */}
                      <div className="flex items-center gap-4 px-4 py-3.5">
                        <div className={cn(
                          "w-11 h-11 rounded-2xl flex items-center justify-center text-2xl shrink-0 transition-transform",
                          isExpanded ? "scale-110" : "",
                          moodOpt?.colorClass,
                        )}>
                          {moodOpt?.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-0.5">
                            {new Date(r.dateISO + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
                          </p>
                          <p className="text-sm font-black text-foreground">{moodOpt?.label}</p>
                          {r.note && !isExpanded && (
                            <p className="text-xs text-muted-foreground truncate mt-0.5">💬 {r.note}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {mc && <span className={cn("text-[10px] font-black px-2 py-0.5 rounded-full", mc.pill)}>{mc.label}</span>}
                          <motion.div animate={{ rotate: isExpanded ? 90 : 0 }} transition={{ duration: 0.2 }}>
                            <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
                          </motion.div>
                        </div>
                      </div>

                      {/* Expanded */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.22 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 pt-0 space-y-3 border-t border-border/30">
                              <p className="text-xs text-muted-foreground font-medium pt-3">{moodOpt?.description}</p>

                              {r.note ? (
                                <div className="bg-muted/40 rounded-xl p-3.5 flex gap-2.5">
                                  <Quote className="h-3.5 w-3.5 text-primary/40 shrink-0 mt-0.5" />
                                  <p className="text-sm font-medium text-foreground leading-relaxed italic">{r.note}</p>
                                </div>
                              ) : (
                                <p className="text-xs text-muted-foreground/70 italic">Nenhuma nota neste dia.</p>
                              )}

                              {r.audioBase64 && (
                                <AudioPlayer audioBase64={r.audioBase64} durationSec={r.audioDurationSec} />
                              )}

                              <div className="flex justify-end">
                                <button
                                  onClick={(e) => handleDelete(r.id, e)}
                                  className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground/60 hover:text-rose-500 transition-colors px-2 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20"
                                >
                                  <Trash2 className="h-3 w-3" /> Apagar
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

      </motion.div>
    </AppShell>
  );
}