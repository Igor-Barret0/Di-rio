"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import type { MoodRecord } from "@/lib/moods/types";
import { moodEmoji, moodScore, MOOD_OPTIONS } from "@/lib/moods/options";

function formatDateLabel(dateISO: string) {
  const [y, m, d] = dateISO.split("-");
  return `${d}/${m}`;
}

export function EmotionChart({
  records,
  height = 280,
}: {
  records: MoodRecord[];
  height?: number;
}) {
  const data = React.useMemo(() => {
    return [...records]
      .sort((a, b) => (a.dateISO > b.dateISO ? 1 : -1))
      .map((r) => ({
        dateISO: r.dateISO,
        dateLabel: formatDateLabel(r.dateISO),
        score: moodScore(r.mood),
        emoji: moodEmoji(r.mood),
        moodLabel: MOOD_OPTIONS.find(m => m.key === r.mood)?.label
      }));
  }, [records]);

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
          <XAxis 
            dataKey="dateLabel" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600 }}
            dy={10}
          />
          <YAxis 
            domain={[1, 4]} 
            ticks={[1, 2, 3, 4]} 
            axisLine={false} 
            tickLine={false}
            tick={{ fill: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600 }}
          />
          <Tooltip
            content={({ active, payload }) => {
              const p = payload?.[0]?.payload as
                | { dateISO: string; score: number; emoji: string; moodLabel: string }
                | undefined;
              if (!active || !p) return null;
              return (
                <div className="rounded-2xl border bg-white/80 backdrop-blur-xl p-4 shadow-2xl ring-1 ring-black/5">
                  <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{p.dateISO}</div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{p.emoji}</span>
                    <span className="text-sm font-black text-foreground">{p.moodLabel}</span>
                  </div>
                </div>
              );
            }}
          />
          <Area
            type="monotone"
            dataKey="score"
            stroke="var(--primary)"
            strokeWidth={4}
            fillOpacity={1}
            fill="url(#colorScore)"
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
