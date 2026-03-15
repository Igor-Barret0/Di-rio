"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { MOOD_OPTIONS } from "@/lib/moods/options";
import type { MoodKey } from "@/lib/moods/types";
import { MoodCard } from "@/components/mood/MoodCard";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Sparkles, ArrowRight, Pencil, Check, X, Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { VoiceRecorder } from "@/components/shared/VoiceRecorder";

export function MoodSelector({
  value,
  onChange,
  disabled,
}: {
  value?: MoodKey | null;
  onChange: (mood: MoodKey, note?: string, audioBase64?: string, audioDurationSec?: number) => void;
  disabled?: boolean;
}) {
  const [justSaved, setJustSaved] = React.useState<MoodKey | null>(null);
  const [showSupport, setShowSupport] = React.useState(false);
  const [pendingMood, setPendingMood] = React.useState<MoodKey | null>(null);
  const [note, setNote] = React.useState("");
  const [savedNote, setSavedNote] = React.useState("");
  const [audioBase64, setAudioBase64] = React.useState<string | undefined>();
  const [audioDurationSec, setAudioDurationSec] = React.useState<number>(0);
  const router = useRouter();


  const handleSelect = (mood: MoodKey) => {
    setPendingMood(mood);
    if (mood !== value) setSavedNote("");
  };

  const handleSave = () => {
    if (!pendingMood) return;
    const moodOpt = MOOD_OPTIONS.find(o => o.key === pendingMood);
    onChange(pendingMood, note.trim() || undefined, audioBase64, audioDurationSec || undefined);
    setSavedNote(note.trim());
    setJustSaved(pendingMood);
    toast.success(`${moodOpt?.emoji} Humor salvo — ${moodOpt?.label}!`, {
      description: note.trim() ? `💬 "${note.trim()}"` : moodOpt?.description,
      duration: 4000,
      position: "bottom-center",
    });

    if (pendingMood === "sad" || pendingMood === "anxious" || pendingMood === "angry") {
      setTimeout(() => setShowSupport(true), 800);
    }

    window.setTimeout(() => setJustSaved(null), 1200);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-2 sm:gap-3 px-1">
        {MOOD_OPTIONS.map((opt) => (
          <MoodCard
            key={opt.key}
            option={opt}
            selected={(pendingMood ?? value) === opt.key}
            disabled={disabled}
            onSelect={handleSelect}
          />
        ))}
      </div>

      {/* Campo de nota */}
      <AnimatePresence initial={false}>
        {pendingMood && (
          <motion.div
            key="note-field"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
            style={{ overflow: "hidden" }}
          >
            <div className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm">
              {/* top gradient bar */}
              <div className="h-0.5 w-full bg-linear-to-r from-indigo-400 via-violet-400 to-purple-400" />

              <div className="p-4 space-y-3">
                {/* header */}
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-linear-to-br from-indigo-400 to-violet-500 flex items-center justify-center shadow-sm">
                    <Pencil className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-sm font-bold text-foreground">
                    Como foi seu dia? <span className="text-muted-foreground font-normal text-xs">(opcional)</span>
                  </span>
                </div>

                {/* textarea */}
                <textarea
                  placeholder="Escreva um pensamento, sentimento ou acontecimento..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  maxLength={280}
                  rows={2}
                  className="w-full resize-none rounded-xl border border-border/50 bg-background px-3 py-2.5 text-sm font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-indigo-400/40 transition-shadow"
                  onKeyDown={(e) => { if (e.key === "Enter" && e.ctrlKey) handleSave(); }}
                />

                {/* voice recorder row */}
                <VoiceRecorder
                  hasAudio={!!audioBase64}
                  audioBase64={audioBase64}
                  audioDurationSec={audioDurationSec}
                  onAudio={(b64, dur) => { setAudioBase64(b64); setAudioDurationSec(dur); }}
                  onClear={() => { setAudioBase64(undefined); setAudioDurationSec(0); }}
                />

                {/* footer */}
                <div className="flex items-center justify-between pt-0.5">
                  <span className="text-[11px] text-muted-foreground font-medium tabular-nums">{note.length}/280</span>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSave}
                    className="inline-flex items-center gap-2 rounded-full bg-linear-to-br from-indigo-500 to-violet-600 px-4 py-2 text-xs font-black text-white shadow-md shadow-indigo-500/25 hover:opacity-90 transition-opacity"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Salvar humor
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {justSaved ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="rounded-xl border bg-card/50 backdrop-blur-sm px-4 py-3 text-sm font-medium text-center shadow-inner"
          >
            {savedNote ? `💬 "${savedNote}"` : "Registro salvo com sucesso."}
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* ── Popup de suporte ── */}
      <Dialog open={showSupport} onOpenChange={setShowSupport}>
        <DialogContent showCloseButton={false} className="sm:max-w-sm p-0 overflow-hidden rounded-3xl border-none shadow-2xl">
          {/* gradient header */}
          <div className="relative px-6 pt-8 pb-6 text-center" style={{ background: "linear-gradient(135deg, oklch(0.48 0.22 268) 0%, oklch(0.42 0.18 285) 60%, oklch(0.52 0.20 300) 100%)" }}>
            {/* close button */}
            <button
              onClick={() => setShowSupport(false)}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 transition-colors flex items-center justify-center"
            >
              <X className="h-3.5 w-3.5 text-white" />
            </button>

            {/* decorative blobs */}
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20 pointer-events-none" style={{ background: "oklch(0.85 0.15 190)", filter: "blur(40px)", transform: "translate(20%, -20%)" }} />
            <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full opacity-15 pointer-events-none" style={{ background: "oklch(0.99 0 0)", filter: "blur(30px)", transform: "translate(-20%, 20%)" }} />

            {/* icon */}
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="relative z-10 mx-auto mb-4 w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/25 flex items-center justify-center shadow-lg"
            >
              <Heart className="h-7 w-7 text-white" />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="relative z-10 text-lg font-black text-white leading-snug"
            >
              Percebemos que hoje pode estar sendo um dia difícil.
            </motion.h2>
          </div>

          {/* body */}
          <div className="px-6 py-5 space-y-5 bg-card">
            <p className="text-sm font-medium text-muted-foreground text-center leading-relaxed">
              Não se preocupe, isso não define você. Quer ver algumas dicas rápidas que podem ajudar a melhorar seu momento?
            </p>

            {/* quick tips */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { emoji: "🧘", label: "Respirar" },
                { emoji: "🚶", label: "Caminhar" },
                { emoji: "💧", label: "Água" },
              ].map((tip) => (
                <div key={tip.label} className="flex flex-col items-center gap-1.5 bg-muted/60 rounded-xl p-3">
                  <span className="text-2xl">{tip.emoji}</span>
                  <span className="text-[11px] font-black text-muted-foreground">{tip.label}</span>
                </div>
              ))}
            </div>

            {/* actions */}
            <div className="flex flex-col gap-2">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => { setShowSupport(false); router.push("/insights"); }}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-linear-to-br from-indigo-500 to-violet-600 py-3 text-sm font-black text-white shadow-lg shadow-indigo-500/25 hover:opacity-90 transition-opacity"
              >
                <Sparkles className="h-4 w-4" />
                Ver dicas de bem-estar
                <ArrowRight className="h-4 w-4" />
              </motion.button>
              <button
                onClick={() => setShowSupport(false)}
                className="w-full py-2.5 rounded-2xl text-sm font-bold text-muted-foreground hover:bg-muted transition-colors"
              >
                Agora não
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}