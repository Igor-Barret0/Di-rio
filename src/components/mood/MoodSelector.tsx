"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { MOOD_OPTIONS, moodLabel } from "@/lib/moods/options";
import type { MoodKey } from "@/lib/moods/types";
import { MoodCard } from "@/components/mood/MoodCard";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lightbulb, ArrowRight, Pencil, Check } from "lucide-react";
import { useRouter } from "next/navigation";

export function MoodSelector({
  value,
  onChange,
  disabled,
}: {
  value?: MoodKey | null;
  onChange: (mood: MoodKey, note?: string) => void;
  disabled?: boolean;
}) {
  const [justSaved, setJustSaved] = React.useState<MoodKey | null>(null);
  const [showSupport, setShowSupport] = React.useState(false);
  const [pendingMood, setPendingMood] = React.useState<MoodKey | null>(null);
  const [note, setNote] = React.useState("");
  const [savedNote, setSavedNote] = React.useState("");
  const router = useRouter();

  const handleSelect = (mood: MoodKey) => {
    setPendingMood(mood);
    // Se já tem nota salva, mantém; se mudou o mood limpa
    if (mood !== value) setSavedNote("");
  };

  const handleSave = () => {
    if (!pendingMood) return;
    const moodOpt = MOOD_OPTIONS.find(o => o.key === pendingMood);
    onChange(pendingMood, note.trim() || undefined);
    setSavedNote(note.trim());
    setJustSaved(pendingMood);
    toast.success(`${moodOpt?.emoji} Humor salvo — ${moodOpt?.label}!`, {
      description: note.trim() ? `💬 "${note.trim()}"` : moodOpt?.description,
      duration: 4000,
      position: "bottom-center",
    });

    if (pendingMood === "sad" || pendingMood === "anxious") {
      setTimeout(() => setShowSupport(true), 800);
    }

    window.setTimeout(() => setJustSaved(null), 1200);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 px-1">
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

      {/* Campo de nota — aparece ao selecionar humor */}
      <AnimatePresence>
        {pendingMood && (
          <motion.div
            key="note-field"
            initial={{ opacity: 0, y: 8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: 8, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="bg-card border border-border/50 rounded-2xl p-4 space-y-3 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
                <Pencil className="h-4 w-4" />
                Como foi seu dia? <span className="font-normal opacity-60">(opcional)</span>
              </div>
              <Input
                placeholder="Escreva um pensamento, sentimento ou acontecimento..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={280}
                className="rounded-xl border-border/50 bg-background text-sm font-medium"
                onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{note.length}/280</span>
                <Button
                  size="sm"
                  onClick={handleSave}
                  className="rounded-full gap-2 bg-primary shadow-md shadow-primary/20 font-bold"
                >
                  <Check className="h-4 w-4" />
                  Salvar humor
                </Button>
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

      <Dialog open={showSupport} onOpenChange={setShowSupport}>
        <DialogContent className="sm:max-w-md rounded-4xl">
          <DialogHeader>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30">
              <Lightbulb className="h-6 w-6" />
            </div>
            <DialogTitle className="text-center text-xl font-bold">
              Percebemos que hoje pode estar sendo um dia difícil.
            </DialogTitle>
            <DialogDescription className="text-center pt-2">
              Não se preocupe, isso não define você. Quer ver algumas dicas rápidas que podem ajudar a melhorar seu momento?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowSupport(false)}
              className="rounded-full flex-1"
            >
              Agora não
            </Button>
            <Button 
              onClick={() => {
                setShowSupport(false);
                router.push("/insights");
              }}
              className="rounded-full flex-1 bg-primary shadow-lg shadow-primary/20"
            >
              Ver dicas <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
