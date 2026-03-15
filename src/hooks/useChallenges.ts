"use client";

import * as React from "react";
import type { MoodRecord } from "@/lib/moods/types";
import { CHALLENGES } from "@/lib/challenges/config";
import {
  getChallengeProgress,
  joinChallenge as localJoin,
  markChallengeDay,
  completeChallenge,
  leaveChallenge,
  type ChallengeProgress,
} from "@/lib/challenges/storage";
import { getTodayISO } from "@/lib/storage/moodStorage";
import { apiFetch, getStoredTokens } from "@/lib/api/client";

export interface ChallengeState {
  id: string;
  joined: boolean;
  completedDays: number;
  totalDays: number;
  percent: number;
  done: boolean;
  canMarkToday: boolean;
}

interface ApiChallenge {
  id: string;
  slug: string;
  title: string;
  totalDays: number;
  xpReward: number;
  userChallenge: {
    id: string;
    completedDays: string[];
    completedAt: string | null;
    startedAt: string;
  } | null;
}

export function useChallenges(_records: MoodRecord[]) {
  const [progress, setProgress] = React.useState<ChallengeProgress[]>([]);
  const [dbIdMap, setDbIdMap] = React.useState<Record<string, string>>({});

  const refresh = React.useCallback(async () => {
    if (getStoredTokens()) {
      try {
        const apiChallenges = await apiFetch<ApiChallenge[]>("/challenges");

        // Build slug → backend ID map
        const map: Record<string, string> = {};
        for (const c of CHALLENGES) {
          const apiC = apiChallenges.find((ac) => ac.slug === c.slug);
          if (apiC) map[c.id] = apiC.id;
        }
        setDbIdMap(map);

        // Convert API data to ChallengeProgress format
        const prog: ChallengeProgress[] = apiChallenges
          .filter((ac) => ac.userChallenge !== null)
          .map((ac) => {
            const frontendChallenge = CHALLENGES.find((c) => c.slug === ac.slug);
            if (!frontendChallenge) return null;
            return {
              id: frontendChallenge.id,
              completedDays: ac.userChallenge!.completedDays,
              startedAt: ac.userChallenge!.startedAt,
              completedAt: ac.userChallenge!.completedAt ?? undefined,
            };
          })
          .filter(Boolean) as ChallengeProgress[];

        setProgress(prog);
        return;
      } catch {
        // fall through to localStorage
      }
    }
    setProgress(getChallengeProgress());
  }, []);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  const todayISO = getTodayISO();

  const states: ChallengeState[] = CHALLENGES.map((c) => {
    const p = progress.find((pr) => pr.id === c.id);
    if (!p) return { id: c.id, joined: false, completedDays: 0, totalDays: c.totalDays, percent: 0, done: false, canMarkToday: false };
    const done = !!p.completedAt || p.completedDays.length >= c.totalDays;
    const canMarkToday = !done && !p.completedDays.includes(todayISO);
    return {
      id: c.id,
      joined: true,
      completedDays: p.completedDays.length,
      totalDays: c.totalDays,
      percent: Math.min(100, Math.round((p.completedDays.length / c.totalDays) * 100)),
      done,
      canMarkToday,
    };
  });

  const join = async (id: string) => {
    const dbId = dbIdMap[id];
    if (dbId && getStoredTokens()) {
      try {
        await apiFetch(`/challenges/${dbId}/join`, { method: "POST" });
        await refresh();
        return;
      } catch {
        // fall through to localStorage
      }
    }
    localJoin(id);
    await refresh();
  };

  const markToday = async (id: string) => {
    const dbId = dbIdMap[id];
    if (dbId && getStoredTokens()) {
      try {
        await apiFetch(`/challenges/${dbId}/progress`, { method: "POST" });
        await refresh();
        return;
      } catch {
        // fall through to localStorage
      }
    }
    const p = markChallengeDay(id, todayISO);
    const challenge = CHALLENGES.find((c) => c.id === id);
    if (p && challenge && p.completedDays.length >= challenge.totalDays) {
      completeChallenge(id);
    }
    await refresh();
  };

  const leave = async (id: string) => {
    const dbId = dbIdMap[id];
    if (dbId && getStoredTokens()) {
      try {
        await apiFetch(`/challenges/${dbId}/join`, { method: "DELETE" });
        await refresh();
        return;
      } catch {
        // fall through to localStorage
      }
    }
    leaveChallenge(id);
    await refresh();
  };

  return { states, join, markToday, leave };
}
