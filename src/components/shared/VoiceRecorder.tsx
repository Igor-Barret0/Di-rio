"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Square, Play, Pause, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  onAudio: (base64: string, durationSec: number) => void;
  onClear: () => void;
  hasAudio: boolean;
  audioDurationSec?: number;
  audioBase64?: string;
}

function formatTime(sec: number) {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = (sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function VoiceRecorder({ onAudio, onClear, hasAudio, audioDurationSec = 0, audioBase64 }: Props) {
  const [state, setState] = React.useState<"idle" | "recording" | "recorded">(
    hasAudio ? "recorded" : "idle"
  );
  const [elapsed, setElapsed] = React.useState(0);
  const [playing, setPlaying] = React.useState(false);
  const [playPos, setPlayPos] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);

  const mediaRef = React.useRef<MediaRecorder | null>(null);
  const chunksRef = React.useRef<Blob[]>([]);
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);

  const MAX_SECONDS = 120;

  const startRecording = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(",")[1];
          onAudio(base64, elapsed);
          setState("recorded");
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.start();
      setState("recording");
      setElapsed(0);
      timerRef.current = setInterval(() => {
        setElapsed((prev) => {
          if (prev >= MAX_SECONDS - 1) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch {
      setError("Microfone não disponível. Verifique as permissões do navegador.");
    }
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    mediaRef.current?.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
  };

  const playAudio = () => {
    if (!audioBase64) return;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setPlaying(false);
      return;
    }
    const audio = new Audio(`data:audio/webm;base64,${audioBase64}`);
    audioRef.current = audio;
    audio.play();
    setPlaying(true);
    const interval = setInterval(() => {
      setPlayPos(Math.floor(audio.currentTime));
    }, 500);
    audio.onended = () => {
      clearInterval(interval);
      setPlaying(false);
      setPlayPos(0);
      audioRef.current = null;
    };
  };

  const clear = () => {
    audioRef.current?.pause();
    audioRef.current = null;
    setPlaying(false);
    setPlayPos(0);
    setState("idle");
    setElapsed(0);
    onClear();
  };

  React.useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      audioRef.current?.pause();
    };
  }, []);

  return (
    <div className="space-y-2">
      <AnimatePresence mode="wait">
        {state === "idle" && (
          <motion.button
            key="start"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={startRecording}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border/50 bg-background hover:bg-muted transition-colors text-sm font-bold text-muted-foreground hover:text-foreground"
          >
            <Mic className="h-4 w-4 text-rose-500" />
            Gravar áudio
          </motion.button>
        )}

        {state === "recording" && (
          <motion.div
            key="recording"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center gap-3 px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30"
          >
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="h-2.5 w-2.5 rounded-full bg-rose-500 shrink-0"
            />
            <span className="text-sm font-black text-rose-600 tabular-nums">
              {formatTime(elapsed)} / {formatTime(MAX_SECONDS)}
            </span>
            <button
              onClick={stopRecording}
              className="ml-auto flex items-center gap-1.5 px-2 py-1 rounded-lg bg-rose-600 text-white text-xs font-black hover:bg-rose-700 transition-colors"
            >
              <Square className="h-3 w-3" /> Parar
            </button>
          </motion.div>
        )}

        {state === "recorded" && (
          <motion.div
            key="recorded"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center gap-3 px-3 py-2 rounded-xl bg-primary/5 border border-primary/20"
          >
            <button
              onClick={playAudio}
              className="flex items-center gap-1.5 text-xs font-black text-primary hover:opacity-70 transition-opacity"
            >
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {playing ? formatTime(playPos) : formatTime(audioDurationSec)}
            </button>
            <div className="flex-1 h-1 bg-primary/10 rounded-full overflow-hidden">
              {playing && audioDurationSec > 0 && (
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${(playPos / audioDurationSec) * 100}%` }}
                />
              )}
            </div>
            <span className="text-[10px] font-black text-primary/60 uppercase tracking-widest shrink-0">Áudio</span>
            <button onClick={clear} className="text-muted-foreground hover:text-rose-500 transition-colors">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <p className="text-xs text-rose-500 font-medium flex items-center gap-1.5">
          <MicOff className="h-3.5 w-3.5" /> {error}
        </p>
      )}
    </div>
  );
}
