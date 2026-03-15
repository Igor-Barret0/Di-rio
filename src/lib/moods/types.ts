export type MoodKey = "happy" | "neutral" | "sad" | "anxious" | "angry" | "excited" | "tired";

export type MoodRecord = {
  id: string;
  dateISO: string;
  mood: MoodKey;
  note?: string;
  audioBase64?: string;
  audioDurationSec?: number;
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
