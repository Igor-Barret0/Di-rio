"use client";

import * as React from "react";
import { apiFetch, getStoredTokens } from "@/lib/api/client";

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = React.useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);

  const refresh = React.useCallback(async () => {
    if (!getStoredTokens()) return;
    try {
      const result = await apiFetch<{
        notifications: AppNotification[];
        unreadCount: number;
      }>("/notifications?limit=20");
      setNotifications(result.notifications);
      setUnreadCount(result.unreadCount);
    } catch {
      // silently ignore
    }
  }, []);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  const markAllRead = async () => {
    if (!getStoredTokens()) return;
    try {
      await apiFetch("/notifications/read-all", { method: "PATCH" });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // silently ignore
    }
  };

  const markRead = async (id: string) => {
    if (!getStoredTokens()) return;
    try {
      await apiFetch(`/notifications/${id}/read`, { method: "PATCH" });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // silently ignore
    }
  };

  return { notifications, unreadCount, refresh, markAllRead, markRead };
}
