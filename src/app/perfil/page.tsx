"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Label } from "@/components/ui/label";
import { Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  User, MapPin, GraduationCap, Award, History, TrendingUp,
  Settings, Sun, Moon, Monitor, Bell, BellOff, Lock,
  Download, Trash2, Save, Palette, Database, Zap, Camera,
  Eye, EyeOff, KeyRound, UserX, Shield, Star, FileJson, FileText,
} from "lucide-react";
import { useGamification } from "@/hooks/useGamification";
import { BADGES, ALL_BADGE_KEYS } from "@/lib/gamification/config";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MOOD_OPTIONS } from "@/lib/moods/options";
import { cn } from "@/lib/utils";
import { apiFetch, getStoredTokens } from "@/lib/api/client";
import { useUser } from "@/lib/context/UserContext";
import { useMoodRecords } from "@/hooks/useMoodRecords";

const PROFILE_KEY = "diario_perfil_v1";

function loadProfile() {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(localStorage.getItem(PROFILE_KEY) ?? "null"); }
  catch { return null; }
}

/* ─── Toggle ──────────────────────────────────────────────────────────────────── */
function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
        checked ? "bg-linear-to-r from-indigo-600 to-violet-600" : "bg-muted-foreground/20",
      )}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 700, damping: 30 }}
        className={cn("absolute h-4 w-4 rounded-full bg-white shadow-sm", checked ? "left-6" : "left-1")}
      />
    </button>
  );
}

/* ─── Section card ─────────────────────────────────────────────────────────────── */
function SectionCard({ icon, gradient, title, subtitle, children }: {
  icon: React.ElementType; gradient: string; title: string; subtitle: string; children: React.ReactNode;
}) {
  const Icon = icon;
  return (
    <div className="rounded-3xl border border-border/50 bg-card shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-border/40 flex items-center gap-3">
        <div className={cn("w-9 h-9 rounded-xl bg-linear-to-br flex items-center justify-center shadow-sm", gradient)}>
          <Icon className="w-4.5 h-4.5 text-white" />
        </div>
        <div>
          <p className="text-sm font-black text-foreground">{title}</p>
          <p className="text-[11px] text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

/* ─── SettingRow ────────────────────────────────────────────────────────────────── */
function SettingRow({ icon, title, description, children }: {
  icon: React.ReactNode; title: string; description?: string; children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5 border-b border-border/30 last:border-0">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground shrink-0">
          {icon}
        </div>
        <div>
          <p className="text-sm font-bold text-foreground">{title}</p>
          {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
        </div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

/* ─── Main content ──────────────────────────────────────────────────────────────── */
function PerfilPageContent() {
  const { records } = useMoodRecords();
  const { theme, setTheme } = useTheme();
  const searchParams = useSearchParams();
  const { user, setUser } = useUser();
  const [activeTab, setActiveTab] = React.useState(
    searchParams?.get("tab") === "configuracoes" ? "configuracoes" : "perfil"
  );

  const [nome, setNome] = React.useState("João Silva");
  const [turma, setTurma] = React.useState("8º Ano B");
  const [escola, setEscola] = React.useState("Escola Municipal de Inovação");
  const [notificacoes, setNotificacoes] = React.useState(true);
  const [reminderTime, setReminderTime] = React.useState("20:00");
  const [modoAnonimo, setModoAnonimo] = React.useState(false);
  const [avatarBase64, setAvatarBase64] = React.useState<string>("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [senhaAtual, setSenhaAtual] = React.useState("");
  const [novaSenha, setNovaSenha] = React.useState("");
  const [confirmarSenha, setConfirmarSenha] = React.useState("");
  const [showSenhaAtual, setShowSenhaAtual] = React.useState(false);
  const [showNovaSenha, setShowNovaSenha] = React.useState(false);
  const [changingPassword, setChangingPassword] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [deletePassword, setDeletePassword] = React.useState("");
  const [showDeletePassword, setShowDeletePassword] = React.useState(false);
  const [deletingAccount, setDeletingAccount] = React.useState(false);

  React.useEffect(() => {
    const saved = loadProfile();
    if (saved) {
      if (saved.turma !== undefined) setTurma(saved.turma);
      if (saved.escola !== undefined) setEscola(saved.escola);
      if (saved.notificacoes !== undefined) setNotificacoes(saved.notificacoes);
      if (saved.modoAnonimo !== undefined) setModoAnonimo(saved.modoAnonimo);
      if (saved.avatarBase64 !== undefined) setAvatarBase64(saved.avatarBase64);
    }
  }, []);

  React.useEffect(() => {
    if (user.name && user.name !== "Estudante") setNome(user.name);
    if (user.avatarUrl && !loadProfile()?.avatarBase64) setAvatarBase64(user.avatarUrl);
  }, [user.name, user.avatarUrl]);

  const initials = nome.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

  function saveProfile() {
    localStorage.setItem(PROFILE_KEY, JSON.stringify({ nome, turma, escola, notificacoes, modoAnonimo, avatarBase64 }));
    setUser((prev) => ({ ...prev, name: nome }));
    if (getStoredTokens()) {
      apiFetch("/users/me", { method: "PATCH", body: JSON.stringify({ name: nome, turma, escola }) }).catch(() => {});
    }
    toast.success("Perfil salvo com sucesso!");
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Selecione uma imagem válida."); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("A imagem deve ter no máximo 5 MB."); return; }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      // Renderiza em 600×600 para alta qualidade (retina 3×)
      const SIZE = 600;
      const canvas = document.createElement("canvas");
      canvas.width = SIZE;
      canvas.height = SIZE;
      const ctx = canvas.getContext("2d")!;
      // Crop centralizado (cover)
      const min = Math.min(img.naturalWidth, img.naturalHeight);
      const sx = (img.naturalWidth - min) / 2;
      const sy = (img.naturalHeight - min) / 2;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      // Círculo com clip para preview perfeito
      ctx.beginPath();
      ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(img, sx, sy, min, min, 0, 0, SIZE, SIZE);
      URL.revokeObjectURL(objectUrl);

      const result = canvas.toDataURL("image/jpeg", 0.95);
      setAvatarBase64(result);
      setUser((prev) => ({ ...prev, avatarUrl: result }));
      const saved = loadProfile() ?? {};
      localStorage.setItem(PROFILE_KEY, JSON.stringify({ ...saved, nome, turma, escola, notificacoes, modoAnonimo, avatarBase64: result }));
      if (getStoredTokens()) apiFetch("/users/me", { method: "PATCH", body: JSON.stringify({ avatarUrl: result }) }).catch(() => {});
      toast.success("Foto de perfil atualizada!");
    };
    img.src = objectUrl;
    e.target.value = "";
  }

  async function exportData() {
    let data: unknown;
    if (getStoredTokens()) {
      try { const r = await apiFetch<{ records: unknown[] }>("/moods?limit=9999"); data = r.records; }
      catch { data = JSON.parse(localStorage.getItem("diario_emocional_records_v1") ?? "[]"); }
    } else { data = JSON.parse(localStorage.getItem("diario_emocional_records_v1") ?? "[]"); }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "diario-emocional-dados.json"; a.click();
    URL.revokeObjectURL(url);
    toast.success("Dados exportados em JSON!");
  }

  async function exportPDF() {
    const { jsPDF } = await import("jspdf");

    type RawRecord = { dateISO?: string; mood?: string; note?: string };
    let rawRecords: RawRecord[] = [];
    if (getStoredTokens()) {
      try { const r = await apiFetch<{ records: RawRecord[] }>("/moods?limit=9999"); rawRecords = r.records; }
      catch { rawRecords = JSON.parse(localStorage.getItem("diario_emocional_records_v1") ?? "[]"); }
    } else { rawRecords = JSON.parse(localStorage.getItem("diario_emocional_records_v1") ?? "[]"); }

    const MOOD_LABELS: Record<string, { label: string; color: [number, number, number] }> = {
      happy:   { label: "Feliz",    color: [16, 185, 129]  },
      neutral: { label: "Normal",   color: [59, 130, 246]  },
      sad:     { label: "Triste",   color: [139, 92, 246]  },
      anxious: { label: "Ansioso",  color: [249, 115, 22]  },
    };

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const W = 210; const margin = 18;
    let y = 0;

    /* ── Capa ── */
    doc.setFillColor(15, 10, 46);
    doc.rect(0, 0, W, 297, "F");

    // Gradient bars decorativos
    doc.setFillColor(99, 102, 241);
    doc.roundedRect(margin, 30, W - margin * 2, 1.5, 0.75, 0.75, "F");

    // Título
    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.setTextColor(255, 255, 255);
    doc.text("Diário Emocional", W / 2, 55, { align: "center" });

    doc.setFontSize(13);
    doc.setTextColor(180, 180, 220);
    doc.text("Relatório de Registros de Humor", W / 2, 65, { align: "center" });

    // Info do usuário
    doc.setFontSize(11);
    doc.setTextColor(140, 140, 190);
    doc.text(`Aluno: ${modoAnonimo ? "Usuário Anônimo" : nome}`, W / 2, 80, { align: "center" });
    if (turma) doc.text(`Turma: ${turma}`, W / 2, 87, { align: "center" });
    if (escola) doc.text(`Escola: ${escola}`, W / 2, 94, { align: "center" });
    doc.text(`Gerado em: ${new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}`, W / 2, 101, { align: "center" });

    // Caixa de stats resumo
    const moodCounts: Record<string, number> = {};
    rawRecords.forEach(r => { if (r.mood) moodCounts[r.mood] = (moodCounts[r.mood] ?? 0) + 1; });
    const total = rawRecords.length;

    const statBoxY = 118;
    const cols = [
      { label: "Total de\nRegistros", value: String(total)       },
      { label: "Mais\nFrequente",     value: total > 0 ? (MOOD_LABELS[Object.entries(moodCounts).sort((a,b)=>b[1]-a[1])[0]?.[0]]?.label ?? "—") : "—" },
      { label: "Felizes",             value: String(moodCounts["happy"] ?? 0) },
      { label: "Ansiosos",            value: String(moodCounts["anxious"] ?? 0) },
    ];
    cols.forEach((col, i) => {
      const bx = margin + i * ((W - margin * 2) / 4);
      const bw = (W - margin * 2) / 4 - 3;
      doc.setFillColor(255, 255, 255, 0.07);
      doc.setFillColor(30, 25, 60);
      doc.roundedRect(bx, statBoxY, bw, 22, 3, 3, "F");
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text(col.value, bx + bw / 2, statBoxY + 10, { align: "center" });
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(140, 140, 190);
      col.label.split("\n").forEach((line, li) => doc.text(line, bx + bw / 2, statBoxY + 15 + li * 4, { align: "center" }));
    });

    // Barra inferior decorativa da capa
    doc.setFillColor(99, 102, 241);
    doc.roundedRect(margin, 255, W - margin * 2, 1.5, 0.75, 0.75, "F");
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 120);
    doc.text("Este relatório é de uso pessoal. Não substitui diagnóstico clínico.", W / 2, 270, { align: "center" });

    /* ── Páginas de registros ── */
    if (rawRecords.length > 0) {
      doc.addPage();
      y = margin;

      // Header da página
      doc.setFillColor(99, 102, 241);
      doc.rect(0, 0, W, 12, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text("DIÁRIO EMOCIONAL — REGISTROS", margin, 8);
      doc.text(`${total} registros`, W - margin, 8, { align: "right" });
      y = 22;

      // Cabeçalho da tabela
      doc.setFillColor(245, 245, 255);
      doc.rect(margin, y, W - margin * 2, 8, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(80, 80, 120);
      doc.text("DATA", margin + 3, y + 5.5);
      doc.text("HUMOR", margin + 35, y + 5.5);
      doc.text("NOTA", margin + 65, y + 5.5);
      y += 10;

      const sorted = [...rawRecords].sort((a, b) => (b.dateISO ?? "").localeCompare(a.dateISO ?? ""));

      sorted.forEach((rec, idx) => {
        // Verificar se precisa de nova página
        if (y > 272) {
          doc.addPage();
          doc.setFillColor(99, 102, 241);
          doc.rect(0, 0, W, 12, "F");
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8);
          doc.setTextColor(255, 255, 255);
          doc.text("DIÁRIO EMOCIONAL — REGISTROS (continuação)", margin, 8);
          y = 22;
          // Repetir cabeçalho
          doc.setFillColor(245, 245, 255);
          doc.rect(margin, y, W - margin * 2, 8, "F");
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8);
          doc.setTextColor(80, 80, 120);
          doc.text("DATA", margin + 3, y + 5.5);
          doc.text("HUMOR", margin + 35, y + 5.5);
          doc.text("NOTA", margin + 65, y + 5.5);
          y += 10;
        }

        const rowH = 8;
        // Linha alternada
        if (idx % 2 === 0) {
          doc.setFillColor(250, 250, 255);
          doc.rect(margin, y, W - margin * 2, rowH, "F");
        }

        // Data
        const date = rec.dateISO
          ? new Date(rec.dateISO + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
          : "—";
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(50, 50, 80);
        doc.text(date, margin + 3, y + 5.5);

        // Mood pill
        const moodInfo = rec.mood ? MOOD_LABELS[rec.mood] : null;
        if (moodInfo) {
          doc.setFillColor(...moodInfo.color);
          doc.roundedRect(margin + 33, y + 1.5, 26, 5, 2, 2, "F");
          doc.setFont("helvetica", "bold");
          doc.setFontSize(7);
          doc.setTextColor(255, 255, 255);
          doc.text(moodInfo.label, margin + 46, y + 5.5, { align: "center" });
        }

        // Nota (truncada)
        if (rec.note) {
          const note = rec.note.length > 80 ? rec.note.slice(0, 77) + "…" : rec.note;
          doc.setFont("helvetica", "normal");
          doc.setFontSize(7.5);
          doc.setTextColor(80, 80, 100);
          doc.text(note, margin + 65, y + 5.5, { maxWidth: W - margin - 65 - 5 });
        }

        y += rowH;
      });
    }

    doc.save(`diario-emocional-${new Date().toISOString().slice(0, 10)}.pdf`);
    toast.success("PDF exportado com sucesso!");
  }

  function clearData() {
    if (!confirm("Apagar todos os registros locais? Esta ação não pode ser desfeita.")) return;
    localStorage.removeItem("diario_emocional_records_v1");
    toast.success("Registros locais apagados.");
    window.location.reload();
  }

  async function changePassword() {
    if (!novaSenha || !senhaAtual) { toast.error("Preencha todos os campos."); return; }
    if (novaSenha.length < 8) { toast.error("A nova senha precisa ter pelo menos 8 caracteres."); return; }
    if (novaSenha !== confirmarSenha) { toast.error("As senhas não coincidem."); return; }
    if (!getStoredTokens()) { toast.error("Você precisa estar logado."); return; }
    setChangingPassword(true);
    try {
      await apiFetch("/users/me/password", { method: "PATCH", body: JSON.stringify({ currentPassword: senhaAtual, newPassword: novaSenha }) });
      toast.success("Senha alterada com sucesso!");
      setSenhaAtual(""); setNovaSenha(""); setConfirmarSenha("");
    } catch { toast.error("Senha atual incorreta ou erro ao alterar."); }
    finally { setChangingPassword(false); }
  }

  async function deleteAccount() {
    if (!deletePassword) { toast.error("Digite sua senha para confirmar."); return; }
    if (!getStoredTokens()) { toast.error("Você precisa estar logado."); return; }
    setDeletingAccount(true);
    try {
      await apiFetch("/users/me", { method: "DELETE", body: JSON.stringify({ password: deletePassword }) });
      localStorage.clear(); window.location.href = "/login";
    } catch { toast.error("Senha incorreta ou erro ao excluir conta."); }
    finally { setDeletingAccount(false); }
  }

  const gamification = useGamification(records);
  const [apiStats, setApiStats] = React.useState<{ totalChallengesCompleted: number } | null>(null);
  React.useEffect(() => {
    if (!getStoredTokens()) return;
    apiFetch<{ totalChallengesCompleted: number }>("/users/me/stats").then(setApiStats).catch(() => {});
    apiFetch<{ profile?: { reminderEnabled?: boolean; reminderTime?: string } }>("/users/me")
      .then(u => {
        if (u.profile?.reminderEnabled !== undefined) setNotificacoes(u.profile.reminderEnabled);
        if (u.profile?.reminderTime) setReminderTime(u.profile.reminderTime);
      })
      .catch(() => {});
  }, []);

  const stats = React.useMemo(() => {
    const total = records.length;
    const byMood = records.reduce<Record<string, number>>((acc, r) => { acc[r.mood] = (acc[r.mood] ?? 0) + 1; return acc; }, {});
    const scores = records.map(r => MOOD_OPTIONS.find(m => m.key === r.mood)?.score ?? 0);
    const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const engagement = Math.min(100, Math.round((total / 30) * 100));
    return { total, byMood, avgScore, engagement };
  }, [records]);

  const TABS = [
    { key: "perfil",        label: "Perfil",         icon: User     },
    { key: "configuracoes", label: "Configurações",   icon: Settings },
  ] as const;

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
  const fadeUp = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

  /* ── Input styled ── */
  const inputCls = "h-11 rounded-xl border border-border/60 bg-muted/40 px-4 text-sm font-medium placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400/50 transition-all w-full";

  return (
    <AppShell>
      <motion.div variants={container} initial="hidden" animate="show" className="max-w-5xl mx-auto space-y-6 pb-14">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <motion.div variants={fadeUp}>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <User className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-foreground">Seu Perfil</h1>
          </div>
          <p className="text-sm text-muted-foreground ml-13">Gerencie suas informações e acompanhe sua jornada de bem-estar.</p>
        </motion.div>

        {/* ── Tabs ────────────────────────────────────────────────────────── */}
        <motion.div variants={fadeUp}>
          <div className="flex gap-1.5 p-1 bg-muted/50 rounded-2xl w-fit border border-border/40">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={cn(
                  "flex items-center gap-2 px-5 h-9 rounded-xl text-xs font-bold transition-all",
                  activeTab === key
                    ? "bg-white dark:bg-card shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">

          {/* ══════════════════════ ABA PERFIL ══════════════════════════════ */}
          {activeTab === "perfil" && (
            <motion.div
              key="perfil"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-5"
            >
              {/* ── Coluna esquerda ── */}
              <div className="lg:col-span-4 space-y-4">

                {/* Card de perfil */}
                <div className="rounded-3xl overflow-hidden border border-border/50 shadow-sm bg-card">
                  {/* Cover gradient */}
                  <div className="h-24 bg-linear-to-br from-indigo-600 via-violet-600 to-purple-700 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.15) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.15) 1px,transparent 1px)", backgroundSize: "24px 24px" }} />
                  </div>

                  <div className="px-6 pb-6 -mt-10 flex flex-col items-center text-center">
                    {/* Avatar */}
                    <div className="relative mb-3">
                      <div className="absolute -inset-1 bg-linear-to-br from-indigo-400 to-violet-400 rounded-full blur-sm opacity-40" />
                      <Avatar className="w-28 h-28 border-4 border-card shadow-xl relative">
                        {avatarBase64
                          ? <img src={avatarBase64} alt={nome} className="w-full h-full rounded-full object-cover" style={{ imageRendering: "auto" }} />
                          : <AvatarFallback className="text-2xl font-black bg-muted">{initials}</AvatarFallback>
                        }
                      </Avatar>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 w-7 h-7 bg-linear-to-br from-indigo-600 to-violet-600 text-white rounded-full shadow-md border-2 border-card flex items-center justify-center hover:opacity-90 transition-opacity"
                      >
                        <Camera className="w-3 h-3" />
                      </button>
                      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                    </div>

                    <h2 className="text-lg font-black text-foreground">{modoAnonimo ? "Usuário Anônimo" : nome}</h2>
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                      <span className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">Estudante</span>
                    </div>

                    <div className="w-full mt-5 space-y-2">
                      <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-muted/50 text-left">
                        <GraduationCap className="w-4 h-4 text-indigo-500 shrink-0" />
                        <span className="text-xs font-semibold text-foreground">{turma} · Ensino Fundamental</span>
                      </div>
                      <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-muted/50 text-left">
                        <MapPin className="w-4 h-4 text-indigo-500 shrink-0" />
                        <span className="text-xs font-semibold text-foreground">{escola}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveTab("configuracoes")}
                      className="mt-4 w-full h-10 rounded-xl bg-linear-to-r from-indigo-600 to-violet-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-indigo-500/25 hover:opacity-90 transition-opacity"
                    >
                      <Settings className="w-3.5 h-3.5" /> Editar Perfil
                    </button>
                  </div>
                </div>

                {/* Engajamento */}
                <div className="rounded-3xl overflow-hidden bg-linear-to-br from-indigo-600 to-violet-700 p-5 shadow-xl shadow-indigo-500/20 relative">
                  <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                  <div className="relative space-y-4">
                    <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center backdrop-blur-sm">
                      <Star className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-base font-black text-white">Nível de Engajamento</p>
                      <p className="text-xs text-white/60 mt-0.5">
                        {stats.total > 0 ? `${stats.total} registros este mês` : "Registre seu humor diariamente!"}
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-black text-white/70 uppercase tracking-wider">
                        <span>Progresso Mensal</span>
                        <span>{stats.engagement}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/15 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-white"
                          initial={{ width: 0 }}
                          animate={{ width: `${stats.engagement}%` }}
                          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Coluna direita ── */}
              <div className="lg:col-span-8 space-y-4">

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Total de Registros",    sub: "Desde o início",  value: stats.total,    gradient: "from-indigo-500 to-violet-500",  num: "text-indigo-600 dark:text-indigo-400",  light: "bg-indigo-50 dark:bg-indigo-950/20",  border: "border-indigo-200/60 dark:border-indigo-800/30",  icon: History     },
                    { label: "Bem-estar Médio",        sub: "Score geral",     value: `${Math.round((stats.avgScore / 4) * 100)}%`, gradient: "from-emerald-500 to-teal-500", num: "text-emerald-600 dark:text-emerald-400", light: "bg-emerald-50 dark:bg-emerald-950/20", border: "border-emerald-200/60 dark:border-emerald-800/30", icon: TrendingUp  },
                    { label: "Desafios Concluídos",   sub: "Total geral",     value: apiStats?.totalChallengesCompleted ?? "—", gradient: "from-amber-500 to-orange-500", num: "text-amber-600 dark:text-amber-400", light: "bg-amber-50 dark:bg-amber-950/20", border: "border-amber-200/60 dark:border-amber-800/30", icon: Award },
                  ].map((s) => (
                    <div key={s.label} className={cn("rounded-2xl border p-4 space-y-3", s.light, s.border)}>
                      <div className={cn("w-9 h-9 rounded-xl bg-linear-to-br flex items-center justify-center shadow-sm", s.gradient)}>
                        <s.icon className="w-4.5 h-4.5 text-white" />
                      </div>
                      <div>
                        <p className={cn("text-2xl font-black", s.num)}>{s.value}</p>
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mt-0.5">{s.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Distribuição de humor */}
                <div className="rounded-3xl border border-border/50 bg-card shadow-sm p-5">
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-7 h-7 rounded-xl bg-linear-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm">
                      <TrendingUp className="w-3.5 h-3.5 text-white" />
                    </div>
                    <p className="text-sm font-black text-foreground">Distribuição de Humor</p>
                  </div>
                  <div className="space-y-3">
                    {MOOD_OPTIONS.map((opt) => {
                      const count = stats.byMood[opt.key] ?? 0;
                      const percent = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                      return (
                        <div key={opt.key} className="flex items-center gap-3">
                          <span className="text-lg w-7 text-center shrink-0">{opt.emoji}</span>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-foreground">{opt.label}</span>
                              <span className="text-[11px] font-bold text-muted-foreground">{count} · {percent}%</span>
                            </div>
                            <div className="h-2 rounded-full bg-muted overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${percent}%` }}
                                transition={{ duration: 0.8, delay: 0.1 }}
                                className={cn("h-full rounded-full", opt.colorClass)}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* XP e nível */}
                <div className="rounded-3xl border border-border/50 bg-card shadow-sm p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-xl bg-linear-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-sm">
                        <Zap className="w-3.5 h-3.5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-foreground">Nível {gamification.level} — {gamification.levelLabel}</p>
                        <p className="text-[11px] text-muted-foreground">{gamification.totalXP} XP acumulados</p>
                      </div>
                    </div>
                    <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-md shadow-amber-500/25">
                      <span className="text-lg font-black text-white">{gamification.level}</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-bold text-muted-foreground">
                      <span>{gamification.xpInCurrentLevel} XP</span>
                      <span>{gamification.levelProgress < 100 ? `${gamification.xpForNextLevel - gamification.totalXP} para o próximo nível` : "Nível máximo! 🎉"}</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${gamification.levelProgress}%` }}
                        transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        className="h-full rounded-full bg-linear-to-r from-amber-400 to-orange-500 shadow-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Conquistas */}
                <div className="rounded-3xl border border-border/50 bg-card shadow-sm p-5">
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-7 h-7 rounded-xl bg-linear-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-sm">
                      <Award className="w-3.5 h-3.5 text-white" />
                    </div>
                    <p className="text-sm font-black text-foreground">Conquistas</p>
                    <span className="ml-auto text-[11px] font-bold text-muted-foreground">
                      {gamification.unlockedBadges.length}/{ALL_BADGE_KEYS.length} desbloqueadas
                    </span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                    {ALL_BADGE_KEYS.map((key, i) => {
                      const badge = BADGES[key];
                      const unlocked = gamification.unlockedBadges.includes(key);
                      return (
                        <motion.div
                          key={key}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.04, duration: 0.25 }}
                          title={badge.description}
                          className={cn(
                            "relative rounded-2xl border p-3 flex flex-col items-center text-center gap-1 transition-all",
                            unlocked
                              ? cn(badge.bgColor, badge.borderColor, "shadow-sm")
                              : "bg-muted/20 border-border/30",
                          )}
                        >
                          <span className={cn("text-2xl", !unlocked && "grayscale opacity-30")}>{badge.emoji}</span>
                          {unlocked ? (
                            <p className={cn("text-[9px] font-black uppercase tracking-widest", badge.color)}>Conquista</p>
                          ) : (
                            <Lock className="w-3 h-3 text-muted-foreground/30" />
                          )}
                          <p className={cn("text-[10px] font-bold leading-tight", unlocked ? "text-foreground" : "text-muted-foreground/40")}>{badge.label}</p>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ══════════════════════ ABA CONFIGURAÇÕES ═══════════════════════ */}
          {activeTab === "configuracoes" && (
            <motion.div
              key="configuracoes"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-5"
            >
              {/* Coluna esquerda */}
              <div className="lg:col-span-5 space-y-4">
                <SectionCard icon={User} gradient="from-indigo-500 to-violet-600" title="Minha Conta" subtitle="Informações pessoais">
                  <div className="space-y-4">
                    {[
                      { id: "nome",   label: "Nome completo",    value: nome,   set: setNome,   placeholder: "Seu nome"           },
                      { id: "turma",  label: "Turma / Série",    value: turma,  set: setTurma,  placeholder: "Ex: 8º Ano B"        },
                      { id: "escola", label: "Escola",           value: escola, set: setEscola, placeholder: "Nome da escola"      },
                    ].map(({ id, label, value, set, placeholder }) => (
                      <div key={id} className="space-y-1.5">
                        <Label htmlFor={id} className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">{label}</Label>
                        <input id={id} value={value} onChange={e => set(e.target.value)} placeholder={placeholder} className={inputCls} />
                      </div>
                    ))}
                    <button
                      onClick={saveProfile}
                      className="w-full h-10 rounded-xl bg-linear-to-r from-indigo-600 to-violet-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20 hover:opacity-90 transition-opacity mt-1"
                    >
                      <Save className="w-3.5 h-3.5" /> Salvar Alterações
                    </button>
                  </div>
                </SectionCard>

                {/* Segurança */}
                {getStoredTokens() && (
                  <SectionCard icon={KeyRound} gradient="from-slate-500 to-gray-600" title="Segurança" subtitle="Alterar senha de acesso">
                    <div className="space-y-3">
                      {[
                        { label: "Senha atual",      value: senhaAtual,    set: setSenhaAtual,    show: showSenhaAtual, setShow: setShowSenhaAtual, placeholder: "••••••••" },
                        { label: "Nova senha",        value: novaSenha,     set: setNovaSenha,     show: showNovaSenha,  setShow: setShowNovaSenha,  placeholder: "Mínimo 8 caracteres" },
                        { label: "Confirmar senha",   value: confirmarSenha, set: setConfirmarSenha, show: false, setShow: null, placeholder: "Repita a nova senha" },
                      ].map(({ label, value, set, show, setShow, placeholder }) => (
                        <div key={label} className="space-y-1.5">
                          <Label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">{label}</Label>
                          <div className="relative">
                            <input type={show ? "text" : "password"} value={value} onChange={e => set(e.target.value)} placeholder={placeholder} className={cn(inputCls, setShow && "pr-11")} />
                            {setShow && (
                              <button type="button" onClick={() => setShow(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" tabIndex={-1}>
                                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={changePassword}
                        disabled={changingPassword}
                        className="w-full h-10 rounded-xl bg-muted hover:bg-muted/80 border border-border/60 text-xs font-bold text-foreground flex items-center justify-center gap-2 transition-colors disabled:opacity-40 mt-1"
                      >
                        {changingPassword ? <><span className="w-3.5 h-3.5 rounded-full border-2 border-foreground/30 border-t-foreground animate-spin" /> Alterando...</> : <><KeyRound className="w-3.5 h-3.5" /> Alterar Senha</>}
                      </button>
                    </div>
                  </SectionCard>
                )}
              </div>

              {/* Coluna direita */}
              <div className="lg:col-span-7 space-y-4">

                {/* Aparência */}
                <SectionCard icon={Palette} gradient="from-amber-500 to-orange-500" title="Aparência" subtitle="Tema visual do aplicativo">
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: "light",  label: "Claro",   icon: Sun     },
                      { value: "dark",   label: "Escuro",  icon: Moon    },
                      { value: "system", label: "Sistema", icon: Monitor },
                    ].map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        onClick={() => { setTheme(value); toast.success(`Tema: ${label}`); }}
                        className={cn(
                          "flex flex-col items-center gap-2 p-3.5 rounded-2xl border-2 transition-all font-bold text-xs",
                          theme === value
                            ? "border-indigo-400 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 shadow-sm"
                            : "border-border/50 text-muted-foreground hover:border-border",
                        )}
                      >
                        <Icon className="w-5 h-5" />
                        {label}
                      </button>
                    ))}
                  </div>
                </SectionCard>

                {/* Preferências */}
                <SectionCard icon={Bell} gradient="from-blue-500 to-indigo-600" title="Preferências" subtitle="Notificações e privacidade">
                  <SettingRow
                    icon={notificacoes ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
                    title="Lembretes diários"
                    description="Receba um lembrete para registrar seu humor"
                  >
                    <Toggle
                      checked={notificacoes}
                      onChange={() => {
                        const n = !notificacoes;
                        setNotificacoes(n);
                        if (getStoredTokens()) {
                          apiFetch("/users/me", { method: "PATCH", body: JSON.stringify({ reminderEnabled: n }) }).catch(() => {});
                        }
                        toast.success(n ? "Lembretes ativados" : "Lembretes desativados");
                      }}
                    />
                  </SettingRow>
                  {notificacoes && (
                    <SettingRow
                      icon={<Bell className="w-3.5 h-3.5" />}
                      title="Horário do lembrete"
                      description="Horário em que você será notificado"
                    >
                      <input
                        type="time"
                        value={reminderTime}
                        onChange={e => {
                          const t = e.target.value;
                          setReminderTime(t);
                          if (getStoredTokens()) {
                            apiFetch("/users/me", { method: "PATCH", body: JSON.stringify({ reminderTime: t }) }).catch(() => {});
                          }
                        }}
                        className="h-8 rounded-xl border border-border/60 bg-card px-3 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                      />
                    </SettingRow>
                  )}
                  <SettingRow
                    icon={<Lock className="w-3.5 h-3.5" />}
                    title="Modo anônimo"
                    description="Oculta seu nome no perfil e nas conquistas"
                  >
                    <Toggle checked={modoAnonimo} onChange={() => { const n = !modoAnonimo; setModoAnonimo(n); toast.success(n ? "Modo anônimo ativado" : "Modo anônimo desativado"); }} />
                  </SettingRow>
                </SectionCard>

                {/* Dados */}
                <SectionCard icon={Database} gradient="from-slate-500 to-gray-600" title="Meus Dados" subtitle="Exportar ou apagar registros">
                  <SettingRow
                    icon={<Download className="w-3.5 h-3.5" />}
                    title="Exportar dados"
                    description="Baixe todos os seus registros em JSON ou PDF"
                  >
                    <div className="flex gap-2">
                      <button
                        onClick={exportData}
                        className="h-8 px-3 rounded-xl border border-border/60 text-xs font-bold text-foreground hover:bg-muted/50 transition-colors flex items-center gap-1.5"
                        title="Exportar como JSON"
                      >
                        <FileJson className="w-3.5 h-3.5 text-amber-500" />
                        JSON
                      </button>
                      <button
                        onClick={exportPDF}
                        className="h-8 px-3 rounded-xl border border-indigo-200 dark:border-indigo-800/40 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-colors flex items-center gap-1.5"
                        title="Exportar como PDF"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        PDF
                      </button>
                    </div>
                  </SettingRow>
                  <SettingRow
                    icon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
                    title="Apagar registros locais"
                    description="Remove o histórico salvo neste dispositivo"
                  >
                    <button onClick={clearData} className="h-8 px-3.5 rounded-xl border border-rose-200 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors">
                      Apagar
                    </button>
                  </SettingRow>
                </SectionCard>

                {/* Zona de perigo */}
                {getStoredTokens() && (
                  <div className="rounded-3xl border border-rose-200/60 dark:border-rose-800/30 bg-rose-50 dark:bg-rose-950/10 overflow-hidden">
                    <div className="px-5 py-4 border-b border-rose-200/40 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center">
                        <Shield className="w-4.5 h-4.5 text-rose-600" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-rose-700 dark:text-rose-400">Zona de Perigo</p>
                        <p className="text-[11px] text-rose-600/60">Ações irreversíveis na sua conta</p>
                      </div>
                    </div>
                    <div className="p-5">
                      <AnimatePresence mode="wait">
                        {!showDeleteConfirm ? (
                          <motion.div key="btn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <SettingRow
                              icon={<UserX className="w-3.5 h-3.5 text-rose-500" />}
                              title="Excluir minha conta"
                              description="Remove permanentemente sua conta e todos os dados"
                            >
                              <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="h-8 px-3.5 rounded-xl border border-rose-300 text-xs font-bold text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors"
                              >
                                Excluir conta
                              </button>
                            </SettingRow>
                          </motion.div>
                        ) : (
                          <motion.div key="confirm" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
                            <p className="text-sm font-bold text-rose-700 dark:text-rose-400 leading-relaxed">
                              Esta ação é permanente e irreversível. Todos os seus dados serão apagados. Digite sua senha para confirmar.
                            </p>
                            <div className="relative">
                              <input
                                type={showDeletePassword ? "text" : "password"}
                                value={deletePassword}
                                onChange={e => setDeletePassword(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && deleteAccount()}
                                placeholder="••••••••"
                                className={cn(inputCls, "pr-11 border-rose-200 focus:ring-rose-400/20 focus:border-rose-400/50")}
                              />
                              <button type="button" onClick={() => setShowDeletePassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" tabIndex={-1}>
                                {showDeletePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => { setShowDeleteConfirm(false); setDeletePassword(""); }}
                                className="flex-1 h-9 rounded-xl border border-border/60 text-xs font-bold text-foreground hover:bg-muted/50 transition-colors"
                              >
                                Cancelar
                              </button>
                              <button
                                onClick={deleteAccount}
                                disabled={deletingAccount || !deletePassword}
                                className="flex-1 h-9 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-40 transition-colors shadow-sm"
                              >
                                {deletingAccount
                                  ? <><span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Excluindo...</>
                                  : <><UserX className="w-3.5 h-3.5" /> Confirmar exclusão</>
                                }
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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