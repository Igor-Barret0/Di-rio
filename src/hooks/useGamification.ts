"use client";

import * as React from "react";
import type { MoodRecord } from "@/lib/moods/types";
import type { GamificationState } from "@/lib/gamification/types";
import { computeGamification } from "@/lib/gamification/compute";
import { getChallengeProgress } from "@/lib/challenges/storage";
import { CHALLENGES } from "@/lib/challenges/config";
import { apiFetch, getStoredTokens } from "@/lib/api/client";

const INITIAL: GamificationState = {
  totalXP: 0,
  level: 1,
  levelLabel: "Iniciante",
  xpForNextLevel: 100,
  xpInCurrentLevel: 0,
  levelProgress: 0,
  unlockedBadges: [],
};

export function useGamification(records: MoodRecord[]) {
  const [challengeXP, setChallengeXP] = React.useState(0);
  const [apiTotalXP, setApiTotalXP] = React.useState<number | undefined>();

  React.useEffect(() => {
    // Local challenge XP as fallback
    const progress = getChallengeProgress();
    const xp = progress.reduce((sum, p) => {
      if (!p.completedAt) return sum;
      const challenge = CHALLENGES.find((c) => c.id === p.id);
      return sum + (challenge?.xpReward ?? 0);
    }, 0);
    setChallengeXP(xp);

    // Fetch real XP total from API when authenticated
    if (getStoredTokens()) {
      apiFetch<{ totalXP: number }>("/auth/me")
        .then((user) => setApiTotalXP(user.totalXP))
        .catch(() => {});
    }
  }, []);

  const state = React.useMemo(() => {
    if (records.length > 0 || apiTotalXP !== undefined) {
      return computeGamification(records, challengeXP, apiTotalXP);
    }
    return INITIAL;
  }, [records, challengeXP, apiTotalXP]);

  return state;
}
