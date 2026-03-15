"use client";

import { AppShell } from "@/components/layout/AppShell";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCheck, Trash2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotifications, iconForType } from "@/lib/context/NotificationsContext";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora";
  if (mins < 60) return `${mins}min atrás`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h atrás`;
  return `${Math.floor(hrs / 24)}d atrás`;
}

export default function NotificacoesPage() {
  const { notifications, unreadCount, markAllRead, markRead, clearAll } = useNotifications();

  const readList  = notifications.filter(n => n.read);
  const unreadList = notifications.filter(n => !n.read);

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-6 pb-14">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Bell className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-foreground">Notificações</h1>
                <p className="text-xs text-muted-foreground font-medium">
                  {unreadCount > 0
                    ? `${unreadCount} não lida${unreadCount !== 1 ? "s" : ""}`
                    : "Tudo em dia"}
                </p>
              </div>
            </div>

            {notifications.length > 0 && (
              <div className="flex items-center gap-1.5">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="flex items-center gap-1.5 h-8 px-3 rounded-xl border border-border/60 bg-card text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors whitespace-nowrap shrink-0"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    Marcar lidas
                  </button>
                )}
                <button
                  onClick={clearAll}
                  className="h-8 w-8 rounded-xl border border-border/60 bg-card flex items-center justify-center text-muted-foreground hover:text-rose-500 hover:bg-rose-500/8 hover:border-rose-200 transition-colors"
                  title="Limpar tudo"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* ── Empty state ── */}
        {notifications.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center justify-center py-20 gap-4"
          >
            <div className="w-16 h-16 rounded-3xl bg-muted/50 flex items-center justify-center">
              <Bell className="h-7 w-7 text-muted-foreground/30" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-bold text-foreground">Nenhuma notificação</p>
              <p className="text-xs text-muted-foreground max-w-xs">
                Registre seu humor e complete metas para receber notificações!
              </p>
            </div>
          </motion.div>
        )}

        {/* ── Unread ── */}
        <AnimatePresence>
          {unreadList.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-1.5"
            >
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-1 pb-1">
                Novas
              </p>
              {unreadList.map((notif, i) => (
                <motion.button
                  key={notif.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.3 }}
                  onClick={() => markRead(notif.id)}
                  className="w-full text-left flex items-start gap-3.5 p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/20 border border-indigo-200/50 dark:border-indigo-800/30 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/10 border border-indigo-100 dark:border-white/10 flex items-center justify-center shrink-0 text-xl shadow-sm">
                    {iconForType(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-sm font-bold text-foreground leading-snug">{notif.title}</p>
                    {notif.body && (
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{notif.body}</p>
                    )}
                    <p className="text-[10px] text-indigo-400 font-semibold mt-1.5">{timeAgo(notif.createdAt)}</p>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-2" />
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Read ── */}
        {readList.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-1.5"
          >
            {unreadList.length > 0 && (
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-1 pb-1">
                Anteriores
              </p>
            )}
            {readList.map((notif, i) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03, duration: 0.3 }}
                className="flex items-start gap-3.5 p-4 rounded-2xl bg-card border border-border/40 opacity-60"
              >
                <div className="w-10 h-10 rounded-xl bg-muted/60 flex items-center justify-center shrink-0 text-xl grayscale">
                  {iconForType(notif.type)}
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="text-sm font-semibold text-foreground/70 leading-snug">{notif.title}</p>
                  {notif.body && (
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{notif.body}</p>
                  )}
                  <p className="text-[10px] text-muted-foreground/50 font-medium mt-1.5">{timeAgo(notif.createdAt)}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* ── Footer tip ── */}
        {notifications.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-2 py-2"
          >
            <Sparkles className="h-3 w-3 text-muted-foreground/30" />
            <p className="text-[11px] text-muted-foreground/40 font-medium">
              Clique nas novas notificações para marcá-las como lidas
            </p>
          </motion.div>
        )}

      </div>
    </AppShell>
  );
}