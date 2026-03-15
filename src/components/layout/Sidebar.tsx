"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  BarChart3, Home, Lightbulb, Settings, HelpCircle,
  ChevronRight, PanelLeftClose, PanelLeftOpen, Flame, Plus,
  Trophy, LogOut, Bell, Target, Brain, MessageSquare, Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProfile } from "@/hooks/useProfile";
import { useMoodRecords } from "@/hooks/useMoodRecords";
import { getCurrentStreak } from "@/lib/storage/moodStorage";
import { clearTokens, apiFetch, getStoredTokens } from "@/lib/api/client";
import { useNotifications } from "@/lib/context/NotificationsContext";
import { LogoutModal } from "@/components/shared/LogoutModal";

const NAV_GROUPS = [
  {
    label: "Principal",
    items: [
      { href: "/dashboard",     label: "Início",        icon: Home },
      { href: "/historico",     label: "Jornada",       icon: BarChart3 },
      { href: "/insights",      label: "Dicas",         icon: Lightbulb },
      { href: "/chat",          label: "Chat IA",       icon: MessageSquare },
    ],
  },
  {
    label: "Ferramentas",
    items: [
      { href: "/desafios",      label: "Desafios",      icon: Trophy },
      { href: "/metas",         label: "Metas",         icon: Target },
      { href: "/avaliacoes",    label: "Avaliações",    icon: Brain },
      { href: "/notificacoes",  label: "Notificações",  icon: Bell },
    ],
  },
];

export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const profile = useProfile();
  const { records } = useMoodRecords();
  const streak = React.useMemo(() => getCurrentStreak(records), [records]);
  const { unreadCount } = useNotifications();

  const [confirmLogout, setConfirmLogout] = React.useState(false);
  const isConfigActive = pathname === "/perfil";
  const initials = profile.nome.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "EU";
  const weekProgress = Math.min(
    records.filter((r) => {
      const d = new Date(); d.setDate(d.getDate() - 6);
      return r.dateISO >= `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    }).length,
    7,
  );
  const weekPct = Math.round((weekProgress / 7) * 100);

  async function handleLogout() {
    const tokens = getStoredTokens();
    if (tokens) {
      try { await apiFetch("/auth/logout", { method: "POST", body: JSON.stringify({ refreshToken: tokens.refreshToken }) }); } catch { /* ignore */ }
    }
    clearTokens();
    router.replace("/login");
  }

  return (
    <>
    <aside
      className={cn(
        "hidden md:flex flex-col shrink-0 transition-all duration-300 ease-in-out h-screen sticky top-0 z-40 overflow-hidden",
        "border-r border-white/6",
        "bg-[#0b0b14] text-white/90",
        collapsed ? "w-15.5" : "w-60",
      )}
    >
      {/* Gradiente superior decorativo */}
      <div className="absolute top-0 left-0 right-0 h-40 bg-linear-to-b from-indigo-600/8 to-transparent pointer-events-none" />

      <div className="relative flex flex-col h-full">

        {/* ── Cabeçalho ─────────────────────────────── */}
        <div className={cn("flex items-center shrink-0 pt-4 pb-3", collapsed ? "flex-col gap-2 px-2.5" : "gap-2 px-3")}>
          {collapsed ? (
            <>
              <button
                onClick={onToggle}
                title="Expandir"
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/8 transition-all"
              >
                <PanelLeftOpen className="h-4.5 w-4.5" />
              </button>
              <button
                title="Novo Registro"
                onClick={() => router.push("/dashboard")}
                className="w-9 h-9 rounded-xl flex items-center justify-center bg-linear-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-105 transition-all"
              >
                <Plus className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => router.push("/dashboard")}
                className="flex-1 flex items-center gap-2.5 h-9 px-3.5 rounded-xl bg-linear-to-r from-indigo-600 to-violet-600 text-white text-sm font-bold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:brightness-110 transition-all whitespace-nowrap overflow-hidden"
              >
                <Plus className="h-3.5 w-3.5 shrink-0" />
                Novo Registro
              </button>
              <button
                onClick={onToggle}
                title="Recolher"
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white/35 hover:text-white/80 hover:bg-white/6 transition-all shrink-0"
              >
                <PanelLeftClose className="h-4 w-4" />
              </button>
            </>
          )}
        </div>

        {/* ── Navegação ─────────────────────────────── */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-none px-2.5 space-y-1 pb-2">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="space-y-0.5">
              {!collapsed && (
                <p className="px-3 pt-3 pb-1 text-[10px] font-black uppercase tracking-[0.2em] text-white/40 select-none">
                  {group.label}
                </p>
              )}
              {collapsed && <div className="h-px bg-white/5 mx-1 my-2" />}

              {group.items.map((item) => {
                const isActive = pathname === item.href;
                const isNotif = item.href === "/notificacoes";
                const badge = isNotif && unreadCount > 0 ? unreadCount : 0;

                if (collapsed) {
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={badge ? `${item.label} (${badge})` : item.label}
                      className={cn(
                        "relative flex items-center justify-center h-10 w-full rounded-xl transition-all",
                        isActive
                          ? "bg-indigo-500/40 text-white"
                          : "text-white/90 hover:text-white hover:bg-white/8",
                      )}
                    >
                      <item.icon className="h-4.5 w-4.5" />
                      {isActive && (
                        <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r-full bg-indigo-400" />
                      )}
                      {badge > 0 && (
                        <span className="absolute top-1 right-1 min-w-3.5 h-3.5 px-0.5 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center leading-none">
                          {badge > 9 ? "9+" : badge}
                        </span>
                      )}
                    </Link>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "relative flex items-center gap-3 h-9 px-3 rounded-xl transition-all duration-200 group",
                      isActive
                        ? "bg-indigo-500/15 text-white"
                        : "text-white/90 hover:text-white hover:bg-white/6",
                    )}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="sidebar-pill"
                        className="absolute left-0 top-1.5 bottom-1.5 w-0.75 rounded-r-full bg-indigo-400"
                        transition={{ type: "spring", stiffness: 500, damping: 35 }}
                      />
                    )}

                    <div className={cn(
                      "w-6 h-6 flex items-center justify-center shrink-0 rounded-lg transition-all",
                      isActive
                        ? "bg-indigo-500/30 text-indigo-300"
                        : "text-white/90 group-hover:text-white",
                    )}>
                      <item.icon className="h-3.5 w-3.5" />
                    </div>

                    <span className="text-sm font-semibold tracking-tight flex-1 whitespace-nowrap">
                      {item.label}
                    </span>

                    {badge > 0 && (
                      <span className="ml-auto min-w-4.5 h-4.5 px-1 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center leading-none">
                        {badge > 9 ? "9+" : badge}
                      </span>
                    )}

                    {isActive && !badge && (
                      <ChevronRight className="ml-auto h-3 w-3 text-indigo-400/60 shrink-0" />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}

          {/* ── Card de progresso ──────────────────── */}
          {!collapsed && (
            <div className="pt-3 pb-1">
              <p className="px-3 pt-1 pb-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/40 select-none">
                Progresso
              </p>
              <div className="rounded-2xl bg-white/4 border border-white/[0.07] p-3.5 space-y-3.5">

                {/* Sequência */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-orange-500/15 flex items-center justify-center">
                      <Flame className="h-3.5 w-3.5 text-orange-400" />
                    </div>
                    <span className="text-xs font-semibold text-white/60">Sequência</span>
                  </div>
                  <span className="text-xs font-black text-orange-400 tabular-nums">
                    {streak} dia{streak !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* Meta semanal */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] text-white/30 font-semibold">
                    <span>Meta semanal</span>
                    <span className="tabular-nums">{weekProgress}/7</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-white/[0.07] overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-linear-to-r from-indigo-500 to-violet-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${weekPct}%` }}
                      transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }}
                    />
                  </div>
                </div>

                {/* XP */}
                <div className="flex items-center gap-2 pt-0.5 border-t border-white/6">
                  <div className="w-6 h-6 rounded-lg bg-violet-500/15 flex items-center justify-center">
                    <Zap className="h-3.5 w-3.5 text-violet-400" />
                  </div>
                  <span className="text-xs font-semibold text-white/60">XP Total</span>
                  <span className="ml-auto text-xs font-black text-violet-400 tabular-nums">
                    {records.length * 10} XP
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Versão colapsada da sequência */}
          {collapsed && (
            <Link
              href="/historico"
              title={`Sequência: ${streak} dia${streak !== 1 ? "s" : ""}`}
              className="flex items-center justify-center h-10 w-full rounded-xl text-orange-400/80 hover:text-orange-400 hover:bg-white/6 transition-all"
            >
              <Flame className="h-4.5 w-4.5" />
            </Link>
          )}
        </div>

        {/* ── Rodapé ────────────────────────────────── */}
        <div className="shrink-0 border-t border-white/6 pt-2 pb-3 px-2.5">
          {collapsed ? (
            <div className="flex flex-col items-center gap-1">
              <Link
                href="/perfil?tab=configuracoes"
                title="Configurações"
                className={cn(
                  "flex items-center justify-center h-10 w-full rounded-xl transition-all group",
                  isConfigActive ? "bg-indigo-500/40 text-white" : "text-white/90 hover:text-white hover:bg-white/8",
                )}
              >
                <Settings className="h-4.5 w-4.5 transition-transform duration-300 group-hover:rotate-90" />
              </Link>
              <a
                href="https://cvv.org.br/chat"
                target="_blank"
                rel="noopener noreferrer"
                title="Suporte — CVV"
                className="flex items-center justify-center h-10 w-full rounded-xl text-white/90 hover:text-white hover:bg-white/8 transition-all"
              >
                <HelpCircle className="h-4.5 w-4.5" />
              </a>
              <button
                onClick={() => setConfirmLogout(true)}
                title="Sair"
                className="flex items-center justify-center h-10 w-full rounded-xl text-white/60 hover:text-rose-400 hover:bg-rose-500/8 transition-all"
              >
                <LogOut className="h-4.5 w-4.5" />
              </button>
              <div className="mt-1 pt-1 border-t border-white/6 w-full flex justify-center">
                <Avatar className="w-8 h-8 rounded-xl shadow-md shadow-indigo-500/20">
                  <AvatarImage src={profile.avatarUrl ?? undefined} alt={profile.nome} className="object-cover" />
                  <AvatarFallback className="rounded-xl bg-linear-to-br from-indigo-600 to-violet-600 text-[11px] font-bold text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          ) : (
            <div className="space-y-0.5">
              <Link
                href="/perfil?tab=configuracoes"
                className={cn(
                  "flex items-center gap-3 h-9 px-3 rounded-xl text-sm font-medium transition-all group",
                  isConfigActive ? "bg-indigo-500/15 text-white" : "text-white/90 hover:text-white hover:bg-white/6",
                )}
              >
                <Settings className={cn("h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-90 shrink-0", isConfigActive && "text-indigo-300")} />
                Configurações
              </Link>
              <a
                href="https://cvv.org.br/chat"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 h-9 px-3 rounded-xl text-sm font-medium text-white/90 hover:text-white hover:bg-white/6 transition-all"
              >
                <HelpCircle className="h-3.5 w-3.5 shrink-0" />
                Suporte
              </a>
              <button
                onClick={() => setConfirmLogout(true)}
                className="w-full flex items-center gap-3 h-9 px-3 rounded-xl text-sm font-medium text-white/90 hover:text-rose-400 hover:bg-rose-500/8 transition-all"
              >
                <LogOut className="h-3.5 w-3.5 shrink-0" />
                Sair
              </button>

              {/* User card */}
              <div className="pt-2 mt-1 border-t border-white/6">
                <Link
                  href="/perfil"
                  className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-white/6 transition-all group"
                >
                  <div className="relative shrink-0">
                    <Avatar className="w-8 h-8 rounded-xl shadow-md shadow-indigo-500/20">
                      <AvatarImage src={profile.avatarUrl ?? undefined} alt={profile.nome} className="object-cover" />
                      <AvatarFallback className="rounded-xl bg-linear-to-br from-indigo-600 to-violet-600 text-[11px] font-bold text-white">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    {/* Online dot */}
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#0b0b14]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-white/85 truncate leading-tight">{profile.nome}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />
                      <p className="text-[10px] text-violet-400/80 font-semibold truncate leading-none">Estudante</p>
                    </div>
                  </div>
                  <ChevronRight className="h-3 w-3 text-white/15 group-hover:text-white/40 transition-colors shrink-0" />
                </Link>
              </div>
            </div>
          )}
        </div>

      </div>
    </aside>

    <LogoutModal
      open={confirmLogout}
      onClose={() => setConfirmLogout(false)}
      onConfirm={handleLogout}
    />
    </>
  );
}