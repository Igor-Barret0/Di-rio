"use client";

import * as React from "react";
import type { MoodKey, MoodRecord } from "@/lib/moods/types";
import {
  getMoodRecords,
  getTodayISO,
  upsertMoodForDate,
} from "@/lib/storage/moodStorage";
import { apiFetch, getStoredTokens } from "@/lib/api/client";
import { useNotifications } from "@/lib/context/NotificationsContext";

export function useMoodRecords() {
  const [records, setRecords] = React.useState<MoodRecord[]>([]);
  const [loading, setLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    try {
      if (getStoredTokens()) {
        const result = await apiFetch<{ records: MoodRecord[] }>("/moods?limit=365");
        setRecords(result.records);
        setLoading(false);
        return;
      }
    } catch {
      // Falha na API — usa localStorage como fallback
    }
    setRecords(getMoodRecords());
    setLoading(false);
  }, []);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  /**
   * Atualização otimista: salva no localStorage imediatamente e
   * sincroniza com o backend em background.
   */
  const { refresh: refreshNotifications } = useNotifications();

  const saveToday = React.useCallback(
    (
      mood: MoodKey,
      note?: string,
      audioBase64?: string,
      audioDurationSec?: number,
    ): MoodRecord => {
      const today = getTodayISO();

      const record = upsertMoodForDate(today, mood, note, audioBase64, audioDurationSec);
      setRecords((prev) => prev.filter((r) => r.dateISO !== today).concat(record));

      if (getStoredTokens()) {
        apiFetch<MoodRecord>("/moods", {
          method: "POST",
          body: JSON.stringify({ dateISO: today, mood, note, audioBase64, audioDurationSec }),
        })
          .then(() => setTimeout(refreshNotifications, 1200))
          .catch(() => {});
      }

      return record;
    },
    [refreshNotifications],
  );

  return { records, loading, refresh, saveToday };
}
