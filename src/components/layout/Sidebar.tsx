"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  BarChart3,
  Home,
  Lightbulb,
  User,
  Settings,
  HelpCircle,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Flame,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const items = [
  { href: "/dashboard", label: "Início", icon: Home },
  { href: "/historico", label: "Jornada", icon: BarChart3 },
  { href: "/insights", label: "Dicas", icon: Lightbulb },
  { href: "/perfil", label: "Perfil", icon: User },
];

export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle?: () => void }) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col shrink-0 transition-all duration-300 ease-in-out h-screen sticky top-0 z-40",
        "border-r border-white/6 bg-[oklch(0.10_0.03_268)] text-white/65",
        collapsed ? "w-15" : "w-62"
      )}
    >
      <div className="flex flex-col h-full py-3 overflow-hidden">

        {/* ── Cabeçalho ──────────────────────────────── */}
        {collapsed ? (
          /* Modo colapsado: toggle + plus empilhados */
          <div className="flex flex-col items-center gap-1.5 px-3 mb-4">
            <button
              onClick={onToggle}
              title="Expandir barra"
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/8 transition-colors"
            >
              <PanelLeftOpen className="h-4 w-4" />
            </button>
            <button
              title="Novo Registro"
              className="w-9 h-9 rounded-xl bg-white/8 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/12 transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        ) : (
          /* Modo expandido */
          <div className="flex items-center gap-2 mb-5 px-3">
            <button
              style={{ borderRadius: '9999px' }}
              className="flex-1 flex items-center justify-start gap-2.5 h-10 px-3 font-semibold text-sm border-0 bg-primary/90 text-white hover:bg-primary transition-colors shadow-md shadow-primary/20 whitespace-nowrap overflow-hidden cursor-pointer"
            >
              <div className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                <Plus className="h-3.5 w-3.5 text-white" />
              </div>
              Novo Registro
            </button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-xl border-0 text-white/55 hover:text-white/85 hover:bg-white/5 shrink-0 transition-colors"
              onClick={onToggle}
              title="Recolher barra"
            >
              <PanelLeftClose className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* ── Navegação ──────────────────────────────── */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-none px-3 space-y-4">
          <div>
            {!collapsed && (
              <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/45 select-none">
                Menu
              </p>
            )}
            <nav className="space-y-0.5">
              {items.map((item) => {
                const isActive = pathname === item.href;

                if (collapsed) {
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={item.label}
                      className={cn(
                        "flex items-center justify-center h-9 w-full rounded-xl transition-colors",
                        isActive
                          ? "bg-white/10 text-white"
                          : "text-white/55 hover:text-white/85 hover:bg-white/5"
                      )}
                    >
                      <item.icon className="h-4.5 w-4.5" />
                    </Link>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                      isActive
                        ? "bg-white/8 text-white"
                        : "text-white/65 hover:text-white hover:bg-white/5"
                    )}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="sidebar-active-bar"
                        className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-primary"
                        transition={{ type: "spring", stiffness: 400, damping: 32 }}
                      />
                    )}
                    <div
                      className={cn(
                        "w-7 h-7 flex items-center justify-center shrink-0 rounded-lg transition-colors",
                        isActive
                          ? "bg-white/10 text-white"
                          : "bg-white/5 text-white/55 group-hover:bg-white/8 group-hover:text-white"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium tracking-tight whitespace-nowrap">
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* ── Progresso ────────────────────────────── */}
          {collapsed ? (
            <div className="flex flex-col items-center gap-1">
              <div className="w-px h-3 bg-white/8" />
              <Link
                href="/historico"
                title="3 dias de sequência"
                className="flex items-center justify-center h-9 w-full rounded-xl text-orange-400/70 hover:text-orange-400 hover:bg-white/5 transition-colors"
              >
                <Flame className="h-4.5 w-4.5" />
              </Link>
            </div>
          ) : (
            <div>
              <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/45 select-none">
                Progresso
              </p>
              <div className="rounded-2xl bg-white/4 border border-white/7 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flame className="h-4 w-4 text-orange-400" />
                    <span className="text-xs font-semibold text-white/80">Sequência</span>
                  </div>
                  <span className="text-xs font-bold text-orange-400">3 dias</span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] text-white/35 font-medium">
                    <span>Meta semanal</span>
                    <span>3 / 7</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-white/7 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-linear-to-r from-primary to-violet-400"
                      initial={{ width: 0 }}
                      animate={{ width: "43%" }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Rodapé ─────────────────────────────────── */}
        <div className="pt-3 border-t border-white/6 px-3">
          {collapsed ? (
            <div className="flex flex-col items-center gap-0.5">
              <Link
                href="/perfil?tab=configuracoes"
                title="Configurações"
                className="flex items-center justify-center h-9 w-full rounded-xl text-white/55 hover:text-white/85 hover:bg-white/5 transition-colors group"
              >
                <Settings className="h-4.5 w-4.5 transition-transform duration-300 group-hover:rotate-90" />
              </Link>
              <Link
                href="#"
                title="Suporte"
                className="flex items-center justify-center h-9 w-full rounded-xl text-white/55 hover:text-white/85 hover:bg-white/5 transition-colors"
              >
                <HelpCircle className="h-4.5 w-4.5" />
              </Link>
              <div className="w-px h-2 bg-white/8 my-1" />
              <button
                title="João Silva"
                className="w-8 h-8 rounded-xl bg-linear-to-br from-primary to-violet-500 flex items-center justify-center text-[11px] font-bold text-white shadow-md shadow-primary/30 hover:scale-105 transition-transform"
              >
                JS
              </button>
            </div>
          ) : (
            <div className="space-y-0.5">
              <Link
                href="/perfil?tab=configuracoes"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all group"
              >
                <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-white/8 transition-colors shrink-0">
                  <Settings className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
                </div>
                Configurações
              </Link>
              <Link
                href="#"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all group"
              >
                <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-white/8 transition-colors shrink-0">
                  <HelpCircle className="h-4 w-4" />
                </div>
                Suporte
              </Link>
              <div className="pt-2 mt-1 border-t border-white/6">
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors group cursor-pointer">
                  <div className="w-8 h-8 rounded-xl bg-linear-to-br from-primary to-violet-500 flex items-center justify-center text-[11px] font-bold text-white shrink-0 shadow-md shadow-primary/30">
                    JS
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-semibold text-white/85 truncate leading-snug">João Silva</p>
                    <p className="text-[10px] text-white/35 font-medium truncate leading-none mt-0.5">Plano Pro</p>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-white/20 group-hover:text-white/50 transition-colors shrink-0" />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </aside>
  );
}
