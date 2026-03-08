export type MoodKey = "happy" | "neutral" | "sad" | "anxious";

export type MoodRecord = {
  id: string;
  dateISO: string;
  mood: MoodKey;
  note?: string;
};

export type MoodOption = {
  key: MoodKey;
  label: string;
  emoji: string;
  description: string;
  score: number;
  colorClass: string;
  colorHex: string;
};
