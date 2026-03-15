"use client";

import * as React from "react";
import { apiFetch, getStoredTokens } from "@/lib/api/client";

export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  meta?: Record<string, unknown> | null;
  createdAt: string;
}

export function iconForType(type: string): string {
  const map: Record<string, string> = {
    REMINDER:           "🔔",
    BADGE_UNLOCKED:     "🏆",
    CHALLENGE_COMPLETE: "🎯",
    RISK_ALERT:         "⚠️",
    SYSTEM:             "📢",
  };
  return map[type] ?? "📬";
}

interface CtxValue {
  notifications: Notification[];
  unreadCount: number;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clearAll: () => void;
  refresh: () => void;
}

const Ctx = React.createContext<CtxValue | null>(null);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [list, setList] = React.useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);

  const refresh = React.useCallback(async () => {
    if (!getStoredTokens()) return;
    try {
      const res = await apiFetch<{ notifications: Notification[]; unreadCount: number }>("/notifications");
      setList(res.notifications);
      setUnreadCount(res.unreadCount);
    } catch { /* silently fail */ }
  }, []);

  // Fetch on mount + poll every 30s
  React.useEffect(() => {
    refresh();
    const id = setInterval(refresh, 30_000);
    return () => clearInterval(id);
  }, [refresh]);

  const markRead = async (notifId: string) => {
    setList(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
    try { await apiFetch(`/notifications/${notifId}/read`, { method: "PATCH" }); } catch { /* ignore */ }
  };

  const markAllRead = async () => {
    setList(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
    try { await apiFetch("/notifications/read-all", { method: "PATCH" }); } catch { /* ignore */ }
  };

  const clearAll = async () => {
    setList([]);
    setUnreadCount(0);
    try { await apiFetch("/notifications", { method: "DELETE" }); } catch { /* ignore */ }
  };

  return (
    <Ctx.Provider value={{ notifications: list, unreadCount, markRead, markAllRead, clearAll, refresh }}>
      {children}
    </Ctx.Provider>
  );
}

export function useNotifications() {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error("useNotifications must be inside NotificationsProvider");
  return ctx;
}