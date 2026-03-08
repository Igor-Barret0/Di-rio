"use client";

import * as React from "react";
import type { MoodKey, MoodRecord } from "@/lib/moods/types";
import {
  getMoodRecords,
  getTodayISO,
  upsertMoodForDate,
} from "@/lib/storage/moodStorage";

export function useMoodRecords() {
  const [records, setRecords] = React.useState<MoodRecord[]>([]);
  const [loading, setLoading] = React.useState(true);

  const refresh = React.useCallback(() => {
    setRecords(getMoodRecords());
    setLoading(false);
  }, []);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  const saveToday = React.useCallback(
    (mood: MoodKey, note?: string) => {
      const today = getTodayISO();
      const record = upsertMoodForDate(today, mood, note);
      setRecords((prev) => prev.filter((r) => r.dateISO !== today).concat(record));
      return record;
    },
    [setRecords],
  );

  return { records, loading, refresh, saveToday };
}
