"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useMoodRecords } from "@/hooks/useMoodRecords";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { MOOD_OPTIONS, moodEmoji, moodScore } from "@/lib/moods/options";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmotionChart } from "@/components/charts/EmotionChart";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, Calendar, History, TrendingUp, ChevronRight, ChevronDown, Quote } from "lucide-react";

// Calendário tipo GitHub contributions
function MoodCalendar({ records }: { records: { dateISO: string; mood: string }[] }) {
  const recordMap = React.useMemo(() => {
    const m: Record<string, string> = {};
    records.forEach((r) => { m[r.dateISO] = r.mood; });
    return m;
  }, [records]);

  // Gera os últimos 91 dias (13 semanas)
  const days = React.useMemo(() => {
    const out: string[] = [];
    const today = new Date();
    for (let i = 90; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
    }
    return out;
  }, []);

  // Pad início para alinhar na semana certa
  const firstDay = new Date(days[0] + "T00:00:00");
  const padStart = firstDay.getDay(); // 0=Dom
  const paddedDays: (string | null)[] = [...Array(padStart).fill(null), ...days];

  const colorForMood = (mood: string | undefined) => {
    if (!mood) return "bg-muted/40";
    if (mood === "happy") return "bg-emerald-400";
    if (mood === "neutral") return "bg-blue-400";
    if (mood === "sad") return "bg-violet-400";
    if (mood === "anxious") return "bg-orange-400";
    return "bg-muted/40";
  };

  const weekLabels = ["D", "S", "T", "Q", "Q", "S", "S"];
  const weeks: (string | null)[][] = [];
  for (let i = 0; i < paddedDays.length; i += 7) {
    weeks.push(paddedDays.slice(i, i + 7));
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-1">
        <div className="flex flex-col gap-1 mr-1">
          {weekLabels.map((l, i) => (
            <div key={i} className="h-4 w-4 flex items-center justify-center text-[9px] font-black text-muted-foreground/50">{l}</div>
          ))}
        </div>
        <div className="flex gap-1 flex-wrap" style={{ display: "grid", gridTemplateRows: "repeat(7, 1fr)", gridAutoFlow: "column", gap: "4px" }}>
          {paddedDays.map((iso, i) => {
            const mood = iso ? recordMap[iso] : undefined;
            return (
              <div
                key={i}
                title={iso ? `${iso}: ${mood ?? "sem registro"}` : ""}
                className={cn(
                  "h-4 w-4 rounded-sm transition-all",
                  iso ? colorForMood(mood) : "opacity-0"
                )}
              />
            );
          })}
        </div>
      </div>
      {/* Legenda */}
      <div className="flex items-center gap-4 flex-wrap">
        {[
          { mood: "happy", label: "Feliz", color: "bg-emerald-400" },
          { mood: "neutral", label: "Normal", color: "bg-blue-400" },
          { mood: "sad", label: "Triste", color: "bg-violet-400" },
          { mood: "anxious", label: "Ansioso", color: "bg-orange-400" },
          { mood: "", label: "Sem registro", color: "bg-muted/40" },
        ].map((item) => (
          <div key={item.mood} className="flex items-center gap-1.5">
            <div className={cn("h-3 w-3 rounded-sm", item.color)} />
            <span className="text-[10px] font-bold text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function lastNDaysISO(n: number) {
  const out: string[] = [];
  const d = new Date();
  for (let i = 0; i < n; i += 1) {
    const dt = new Date(d);
    dt.setDate(d.getDate() - i);
    const yyyy = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, "0");
    const dd = String(dt.getDate()).padStart(2, "0");
    out.push(`${yyyy}-${mm}-${dd}`);
  }
  return out.reverse();
}

export default function HistoricoPage() {
  const { records, loading } = useMoodRecords();

  const records7 = React.useMemo(() => {
    const days = new Set(lastNDaysISO(7));
    return records.filter((r) => days.has(r.dateISO));
  }, [records]);

  const records30 = React.useMemo(() => {
    const days = new Set(lastNDaysISO(30));
    return records.filter((r) => days.has(r.dateISO));
  }, [records]);

  const timeline = React.useMemo(() => {
    return [...records]
      .sort((a, b) => (a.dateISO < b.dateISO ? 1 : -1))
      .slice(0, 20);
  }, [records]);

  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <AppShell>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-10 pb-12"
      >
        <motion.div variants={itemVariants} className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-primary/10 text-primary shadow-sm">
              <History className="h-6 w-6" />
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-[#0F172A]">Sua Jornada</h1>
          </div>
          <p className="text-lg font-semibold text-[#475569]/80 max-w-2xl">
            Acompanhe a evolução dos seus sentimentos e descubra seus padrões emocionais ao longo do tempo.
          </p>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-none bg-white p-8 rounded-[3rem] shadow-premium ring-1 ring-black/2">
            {loading ? (
              <div className="space-y-4">
                <div className="flex gap-4 mb-4">
                  <Skeleton className="h-12 w-32 rounded-2xl" />
                  <Skeleton className="h-12 w-32 rounded-2xl" />
                </div>
                <Skeleton className="h-72 w-full rounded-3xl" />
              </div>
            ) : (
              <Tabs defaultValue="7d" className="w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
                  <TabsList className="bg-muted/50 p-1 rounded-2xl h-12">
                    <TabsTrigger value="7d" className="rounded-xl px-6 font-bold text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-lg">7 Dias</TabsTrigger>
                    <TabsTrigger value="30d" className="rounded-xl px-6 font-bold text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-lg">30 Dias</TabsTrigger>
                  </TabsList>
                  <div className="flex items-center gap-4 text-xs font-black text-muted-foreground uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      Tendência
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-secondary" />
                      Evolução
                    </div>
                  </div>
                </div>

                <TabsContent value="7d" className="mt-0 focus-visible:outline-none">
                  <EmotionChart records={records7} height={350} />
                </TabsContent>
                <TabsContent value="30d" className="mt-0 focus-visible:outline-none">
                  <EmotionChart records={records30} height={350} />
                </TabsContent>
              </Tabs>
            )}
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-4">
          <div className="flex items-center gap-3 px-2">
            <Calendar className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-black tracking-tight text-foreground">Calendário Emocional</h2>
          </div>
          <Card className="border-none bg-white p-6 rounded-4xl shadow-premium overflow-x-auto">
            <MoodCalendar records={records} />
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-black tracking-tight text-[#0F172A]">Registros Recentes</h2>
            <div className="flex items-center gap-2 text-xs font-black text-primary uppercase tracking-widest">
              Total: {records.length} registros
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {timeline.length === 0 ? (
              <Card className="col-span-full border-none bg-white p-12 rounded-[2.5rem] shadow-premium text-center space-y-4">
                <Calendar className="h-12 w-12 text-muted-foreground/30 mx-auto" />
                <p className="text-lg font-bold text-[#475569]">Nenhum registro encontrado ainda.</p>
              </Card>
            ) : (
              timeline.map((r) => {
                const moodOpt = MOOD_OPTIONS.find(m => m.key === r.mood);
                const isExpanded = expandedId === r.id;
                return (
                  <motion.div
                    key={r.id}
                    layout
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    <Card
                      onClick={() => setExpandedId(isExpanded ? null : r.id)}
                      className="cursor-pointer border-none bg-white rounded-3xl shadow-premium ring-1 ring-black/2 overflow-hidden transition-all hover:shadow-premium-hover"
                    >
                      <div className="flex items-center justify-between p-6">
                        <div className="flex items-center gap-5">
                          <div className={cn(
                            "h-16 w-16 rounded-[1.5rem] flex items-center justify-center text-3xl shadow-inner transition-transform",
                            isExpanded ? "scale-105" : "",
                            moodOpt?.colorClass
                          )}>
                            {moodOpt?.emoji}
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">
                              {new Date(r.dateISO).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                            </p>
                            <h3 className="text-lg font-black text-[#0F172A] tracking-tight">{moodOpt?.label}</h3>
                            {r.note && !isExpanded && (
                              <p className="text-xs text-muted-foreground font-medium truncate max-w-45">💬 {r.note}</p>
                            )}
                          </div>
                        </div>
                        <motion.div animate={{ rotate: isExpanded ? 90 : 0 }} transition={{ duration: 0.2 }}>
                          <ChevronRight className="h-5 w-5 text-muted-foreground/40" />
                        </motion.div>
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden"
                          >
                            <div className="px-6 pb-6 pt-0 space-y-3 border-t border-border/30">
                              <div className="flex items-center gap-2 pt-3">
                                <div className={cn("px-3 py-1 rounded-full text-xs font-black", moodOpt?.colorClass)}>
                                  {moodOpt?.label}
                                </div>
                                <span className="text-xs text-muted-foreground font-semibold">{moodOpt?.description}</span>
                              </div>
                              {r.note ? (
                                <div className="bg-muted/30 rounded-2xl p-4 flex gap-3">
                                  <Quote className="h-4 w-4 text-primary/40 shrink-0 mt-0.5" />
                                  <p className="text-sm font-semibold text-foreground leading-relaxed italic">{r.note}</p>
                                </div>
                              ) : (
                                <p className="text-xs text-muted-foreground font-medium italic">Nenhuma nota registrada neste dia.</p>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </div>
        </motion.div>
      </motion.div>
    </AppShell>
  );
}
