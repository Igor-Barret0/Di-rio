"use client";

import * as React from "react";
import { apiFetch, getStoredTokens } from "@/lib/api/client";

export interface Goal {
  id: string;
  title: string;
  description?: string | null;
  completed: boolean;
  targetDate?: string | null;
  createdAt: string;
}

export function useGoals() {
  const [goals, setGoals] = React.useState<Goal[]>([]);
  const [loading, setLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    if (!getStoredTokens()) { setLoading(false); return; }
    try {
      const result = await apiFetch<{ goals: Goal[] }>("/goals?limit=100");
      setGoals(result.goals);
    } catch {
      // silently ignore
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { refresh(); }, [refresh]);

  const create = async (title: string, description?: string, targetDate?: string) => {
    if (!getStoredTokens()) return;
    const goal = await apiFetch<Goal>("/goals", {
      method: "POST",
      body: JSON.stringify({ title, description: description || undefined, targetDate: targetDate || undefined }),
    });
    setGoals((prev) => [goal, ...prev]);
  };

  const toggle = async (id: string) => {
    const goal = goals.find((g) => g.id === id);
    if (!goal || !getStoredTokens()) return;
    const updated = await apiFetch<Goal>(`/goals/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ completed: !goal.completed }),
    });
    setGoals((prev) => prev.map((g) => (g.id === id ? updated : g)));
  };

  const remove = async (id: string) => {
    if (!getStoredTokens()) return;
    await apiFetch(`/goals/${id}`, { method: "DELETE" });
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const update = async (id: string, title: string, description?: string) => {
    if (!getStoredTokens()) return;
    const updated = await apiFetch<Goal>(`/goals/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ title, description: description || undefined }),
    });
    setGoals((prev) => prev.map((g) => (g.id === id ? updated : g)));
  };

  return { goals, loading, refresh, create, toggle, remove, update };
}
