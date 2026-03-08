"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useMoodRecords } from "@/hooks/useMoodRecords";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { toast } from "sonner";
import { 
  Sparkles, 
  User, 
  MapPin, 
  GraduationCap, 
  Award, 
  History, 
  TrendingUp, 
  Settings,
  ChevronRight,
  ShieldCheck,
  Sun,
  Moon,
  Monitor,
  Bell,
  BellOff,
  Lock,
  Download,
  Trash2,
  Save,
  Palette,
  Database,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { MOOD_OPTIONS } from "@/lib/moods/options";
import { cn } from "@/lib/utils";

const PROFILE_KEY = "diario_perfil_v1";

function loadProfile() {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem(PROFILE_KEY) ?? "null");
  } catch {
    return null;
  }
}

function PerfilPageContent() {
  const { records, loading } = useMoodRecords();
  const { theme, setTheme } = useTheme();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = React.useState(
    searchParams.get("tab") === "configuracoes" ? "configuracoes" : "perfil"
  );

  const savedProfile = loadProfile();
  const [nome, setNome] = React.useState(savedProfile?.nome ?? "João Silva");
  const [turma, setTurma] = React.useState(savedProfile?.turma ?? "8º Ano B");
  const [escola, setEscola] = React.useState(savedProfile?.escola ?? "Escola Municipal de Inovação");
  const [notificacoes, setNotificacoes] = React.useState(savedProfile?.notificacoes ?? true);
  const [modoAnonimo, setModoAnonimo] = React.useState(savedProfile?.modoAnonimo ?? false);

  const initials = nome.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

  function saveProfile() {
    localStorage.setItem(PROFILE_KEY, JSON.stringify({ nome, turma, escola, notificacoes, modoAnonimo }));
    toast.success("Perfil salvo com sucesso!");
  }

  function exportData() {
    const json = localStorage.getItem("diario_emocional_records_v1") ?? "[]";
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "diario-emocional-dados.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Dados exportados!");
  }

  function clearData() {
    if (!confirm("Tem certeza que deseja apagar todos os registros? Esta ação não pode ser desfeita.")) return;
    localStorage.removeItem("diario_emocional_records_v1");
    toast.success("Todos os registros foram apagados.");
    window.location.reload();
  }

  const stats = React.useMemo(() => {
    const total = records.length;
    const byMood = records.reduce<Record<string, number>>((acc, r) => {
      acc[r.mood] = (acc[r.mood] ?? 0) + 1;
      return acc;
    }, {});
    const scores = records.map(r => MOOD_OPTIONS.find(m => m.key === r.mood)?.score ?? 0);
    const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const engagement = Math.min(100, Math.round((total / 30) * 100));
    return { total, byMood, avgScore, engagement };
  }, [records]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const SettingRow = ({
    icon,
    title,
    description,
    children,
  }: {
    icon: React.ReactNode;
    title: string;
    description?: string;
    children: React.ReactNode;
  }) => (
    <div className="flex items-center justify-between gap-4 py-5 border-b border-muted/60 last:border-0">
      <div className="flex items-start gap-4">
        <div className="mt-0.5 h-9 w-9 rounded-xl bg-muted/40 flex items-center justify-center text-muted-foreground shrink-0">
          {icon}
        </div>
        <div>
          <p className="text-sm font-bold text-[#0F172A]">{title}</p>
          {description && <p className="text-xs text-muted-foreground mt-0.5 font-medium">{description}</p>}
        </div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        checked ? "bg-primary" : "bg-muted-foreground/30"
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
          checked ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  );

  return (
    <AppShell>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-8 pb-12"
      >
        <motion.div variants={itemVariants} className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-primary/10 text-primary shadow-sm">
              <User className="h-6 w-6" />
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-[#0F172A]">Seu Perfil</h1>
          </div>
          <p className="text-lg font-semibold text-[#475569]/80 max-w-2xl">
            Gerencie suas informações e veja o resumo da sua dedicação ao seu bem-estar.
          </p>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="h-10 px-1 rounded-xl bg-muted mb-8">
              <TabsTrigger value="perfil" className="rounded-lg px-6 text-sm font-bold">
                <User className="h-4 w-4 mr-2" /> Perfil
              </TabsTrigger>
              <TabsTrigger value="configuracoes" className="rounded-lg px-6 text-sm font-bold">
                <Settings className="h-4 w-4 mr-2" /> Configurações
              </TabsTrigger>
            </TabsList>

            {/* ── ABA PERFIL ───────────────────────────────────── */}
            <TabsContent value="perfil">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4 space-y-6">
                  <Card className="border-none bg-white p-8 rounded-[3rem] shadow-premium ring-1 ring-black/2 relative overflow-hidden text-center flex flex-col items-center">
                    <div className="absolute top-0 left-0 w-full h-32 bg-linear-to-br from-primary/5 to-secondary/5 -z-10" />
                    <div className="relative mb-6">
                      <div className="absolute -inset-2 bg-linear-to-tr from-primary to-secondary rounded-full blur opacity-20" />
                      <Avatar className="h-32 w-24 border-4 border-white shadow-2xl relative">
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback className="text-2xl font-bold">{initials}</AvatarFallback>
                      </Avatar>
                      <div className="absolute bottom-0 right-0 bg-secondary text-white p-2 rounded-full shadow-lg border-4 border-white">
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h2 className="text-2xl font-black tracking-tight text-[#0F172A]">{modoAnonimo ? "Usuário Anônimo" : nome}</h2>
                      <p className="text-sm font-bold text-primary uppercase tracking-widest">Estudante Premium</p>
                    </div>
                    <div className="mt-8 w-full space-y-4 pt-8 border-t border-primary/5">
                      <div className="flex items-center gap-4 px-4 py-3 rounded-2xl bg-muted/30 text-[#475569]">
                        <GraduationCap className="h-5 w-5 text-primary" />
                        <span className="text-sm font-bold">{turma} - Ensino Fundamental</span>
                      </div>
                      <div className="flex items-center gap-4 px-4 py-3 rounded-2xl bg-muted/30 text-[#475569]">
                        <MapPin className="h-5 w-5 text-primary" />
                        <span className="text-sm font-bold">{escola}</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => setActiveTab("configuracoes")}
                      className="mt-8 w-full rounded-2xl font-black text-xs uppercase tracking-widest h-12 shadow-lg shadow-primary/20"
                    >
                      <Settings className="mr-2 h-4 w-4" /> Editar Perfil
                    </Button>
                  </Card>

                  <Card className="border-none bg-linear-to-br from-primary to-indigo-600 p-8 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 bg-white/10 h-32 w-32 rounded-full blur-3xl group-hover:bg-white/20 transition duration-700" />
                    <div className="relative z-10 space-y-6">
                      <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                        <Award className="h-6 w-6" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-black tracking-tight">Nível de Engajamento</h3>
                        <p className="text-white/70 text-sm font-bold">Você registrou seu humor em {stats.total} dias este mês!</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                          <span>Progresso Mensal</span>
                          <span>{stats.engagement}%</span>
                        </div>
                        <Progress value={stats.engagement} className="h-2 bg-white/20 [&>div]:bg-white" />
                      </div>
                    </div>
                  </Card>
                </div>

                <div className="lg:col-span-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border-none bg-white p-8 rounded-[2.5rem] shadow-premium ring-1 ring-black/2">
                      <div className="flex items-start justify-between mb-8">
                        <div className="space-y-1">
                          <h3 className="text-lg font-black text-[#0F172A] tracking-tight">Total de Registros</h3>
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Desde o início</p>
                        </div>
                        <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                          <History className="h-6 w-6" />
                        </div>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-black text-primary">{stats.total}</span>
                        <span className="text-sm font-bold text-muted-foreground uppercase tracking-tighter">dias acumulados</span>
                      </div>
                    </Card>

                    <Card className="border-none bg-white p-8 rounded-[2.5rem] shadow-premium ring-1 ring-black/2">
                      <div className="flex items-start justify-between mb-8">
                        <div className="space-y-1">
                          <h3 className="text-lg font-black text-[#0F172A] tracking-tight">Média de Bem-estar</h3>
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Score Geral</p>
                        </div>
                        <div className="h-12 w-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center">
                          <TrendingUp className="h-6 w-6" />
                        </div>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-black text-secondary">{Math.round((stats.avgScore / 4) * 100)}%</span>
                        <span className="text-sm font-bold text-muted-foreground uppercase tracking-tighter">estabilidade</span>
                      </div>
                    </Card>
                  </div>

                  <Card className="border-none bg-white p-10 rounded-[3rem] shadow-premium ring-1 ring-black/2">
                    <h3 className="text-xl font-black text-[#0F172A] tracking-tight mb-8">Distribuição de Humor</h3>
                    <div className="space-y-6">
                      {MOOD_OPTIONS.map((opt) => {
                        const count = stats.byMood[opt.key] ?? 0;
                        const percent = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                        return (
                          <div key={opt.key} className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">{opt.emoji}</span>
                                <span className="text-sm font-bold text-[#0F172A]">{opt.label}</span>
                              </div>
                              <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">{count} registros ({percent}%)</span>
                            </div>
                            <div className="relative h-4 w-full rounded-full bg-muted/30 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${percent}%` }}
                                transition={{ duration: 1, delay: 0.5 }}
                                className={cn("h-full rounded-full shadow-sm", opt.colorClass)}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Card>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                    <div className="p-6 rounded-4xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 flex flex-col items-center text-center gap-2">
                      <Sparkles className="h-6 w-6 text-emerald-600 mb-1" />
                      <p className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Conquista</p>
                      <p className="text-sm font-bold text-emerald-900 dark:text-emerald-100 leading-tight">Mestre da Consistência</p>
                    </div>
                    <div className="p-6 rounded-4xl bg-blue-50 dark:bg-blue-950/20 border border-blue-100 flex flex-col items-center text-center gap-2 opacity-50 grayscale">
                      <Award className="h-6 w-6 text-blue-600 mb-1" />
                      <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest">Bloqueado</p>
                      <p className="text-sm font-bold text-blue-900 dark:text-blue-100 leading-tight">Explorador de Emoções</p>
                    </div>
                    <div className="p-6 rounded-4xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 flex flex-col items-center text-center gap-2 opacity-50 grayscale">
                      <ShieldCheck className="h-6 w-6 text-amber-600 mb-1" />
                      <p className="text-[10px] font-black uppercase text-amber-600 tracking-widest">Bloqueado</p>
                      <p className="text-sm font-bold text-amber-900 dark:text-amber-100 leading-tight">Guardião da Mente</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* ── ABA CONFIGURAÇÕES ─────────────────────────────── */}
            <TabsContent value="configuracoes">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Coluna esquerda */}
                <div className="lg:col-span-5 space-y-6">

                  {/* Minha Conta */}
                  <Card className="border-none bg-white p-8 rounded-[2.5rem] shadow-premium ring-1 ring-black/2">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-black text-[#0F172A] tracking-tight">Minha Conta</h3>
                        <p className="text-xs font-medium text-muted-foreground">Informações pessoais</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="nome" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Nome completo</Label>
                        <Input
                          id="nome"
                          value={nome}
                          onChange={e => setNome(e.target.value)}
                          placeholder="Seu nome"
                          className="h-11 rounded-xl text-sm font-semibold"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="turma" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Turma / Série</Label>
                        <Input
                          id="turma"
                          value={turma}
                          onChange={e => setTurma(e.target.value)}
                          placeholder="Ex: 8º Ano B"
                          className="h-11 rounded-xl text-sm font-semibold"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="escola" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Escola</Label>
                        <Input
                          id="escola"
                          value={escola}
                          onChange={e => setEscola(e.target.value)}
                          placeholder="Nome da escola"
                          className="h-11 rounded-xl text-sm font-semibold"
                        />
                      </div>
                      <Button onClick={saveProfile} className="w-full h-11 rounded-xl font-black text-xs uppercase tracking-widest mt-2">
                        <Save className="mr-2 h-4 w-4" /> Salvar Alterações
                      </Button>
                    </div>
                  </Card>
                </div>

                {/* Coluna direita */}
                <div className="lg:col-span-7 space-y-6">

                  {/* Aparência */}
                  <Card className="border-none bg-white p-8 rounded-[2.5rem] shadow-premium ring-1 ring-black/2">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-10 w-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                        <Palette className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-black text-[#0F172A] tracking-tight">Aparência</h3>
                        <p className="text-xs font-medium text-muted-foreground">Tema visual do aplicativo</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mt-6">
                      {[
                        { value: "light", label: "Claro", icon: Sun },
                        { value: "dark", label: "Escuro", icon: Moon },
                        { value: "system", label: "Sistema", icon: Monitor },
                      ].map(({ value, label, icon: Icon }) => (
                        <button
                          key={value}
                          onClick={() => setTheme(value)}
                          className={cn(
                            "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all font-bold text-sm",
                            theme === value
                              ? "border-primary bg-primary/5 text-primary shadow-sm"
                              : "border-muted/60 text-muted-foreground hover:border-primary/30 hover:text-foreground"
                          )}
                        >
                          <Icon className="h-5 w-5" />
                          {label}
                        </button>
                      ))}
                    </div>
                  </Card>

                  {/* Notificações e Privacidade */}
                  <Card className="border-none bg-white px-8 pt-6 pb-2 rounded-[2.5rem] shadow-premium ring-1 ring-black/2">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-10 w-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <Bell className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-black text-[#0F172A] tracking-tight">Preferências</h3>
                        <p className="text-xs font-medium text-muted-foreground">Notificações e privacidade</p>
                      </div>
                    </div>

                    <SettingRow
                      icon={notificacoes ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                      title="Lembretes diários"
                      description="Receba um lembrete para registrar seu humor"
                    >
                      <Toggle checked={notificacoes} onChange={() => setNotificacoes((v: boolean) => !v)} />
                    </SettingRow>

                    <SettingRow
                      icon={<Lock className="h-4 w-4" />}
                      title="Modo anônimo"
                      description="Oculta seu nome no perfil e nas conquistas"
                    >
                      <Toggle checked={modoAnonimo} onChange={() => setModoAnonimo((v: boolean) => !v)} />
                    </SettingRow>
                  </Card>

                  {/* Dados */}
                  <Card className="border-none bg-white px-8 pt-6 pb-2 rounded-[2.5rem] shadow-premium ring-1 ring-black/2">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-10 w-10 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center">
                        <Database className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-black text-[#0F172A] tracking-tight">Meus Dados</h3>
                        <p className="text-xs font-medium text-muted-foreground">Exportar ou apagar registros</p>
                      </div>
                    </div>

                    <SettingRow
                      icon={<Download className="h-4 w-4" />}
                      title="Exportar dados"
                      description="Baixe todos os seus registros em JSON"
                    >
                      <Button variant="outline" size="sm" onClick={exportData} className="rounded-xl font-bold text-xs h-9 px-4">
                        Exportar
                      </Button>
                    </SettingRow>

                    <SettingRow
                      icon={<Trash2 className="h-4 w-4 text-rose-500" />}
                      title="Apagar todos os registros"
                      description="Remove permanentemente todo o seu histórico"
                    >
                      <Button variant="outline" size="sm" onClick={clearData} className="rounded-xl font-bold text-xs h-9 px-4 border-rose-200 text-rose-600 hover:bg-rose-50">
                        Apagar
                      </Button>
                    </SettingRow>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </AppShell>
  );
}

export default function PerfilPage() {
  return (
    <Suspense fallback={null}>
      <PerfilPageContent />
    </Suspense>
  );
}
