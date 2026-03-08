"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MoodOption } from "@/lib/moods/types";

// mapeamento de cores vivas por mood
const moodStyles: Record<string, { bg: string; ring: string; label: string; glow: string }> = {
  happy:   { bg: "from-emerald-50 via-emerald-100 to-emerald-200", ring: "ring-emerald-400", label: "text-emerald-700", glow: "shadow-emerald-200" },
  neutral: { bg: "from-blue-50 via-blue-100 to-blue-200",         ring: "ring-blue-400",    label: "text-blue-700",    glow: "shadow-blue-200"    },
  sad:     { bg: "from-violet-50 via-violet-100 to-violet-200",   ring: "ring-violet-400", label: "text-violet-700", glow: "shadow-violet-200" },
  anxious: { bg: "from-orange-50 via-orange-100 to-orange-200",   ring: "ring-orange-400", label: "text-orange-700", glow: "shadow-orange-200"  },
};

export function MoodCard({
  option,
  selected,
  onSelect,
  disabled,
}: {
  option: MoodOption;
  selected?: boolean;
  onSelect: (key: MoodOption["key"]) => void;
  disabled?: boolean;
}) {
  const style = moodStyles[option.key] ?? moodStyles.neutral;

  return (
    <motion.button
      type="button"
      disabled={disabled}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onSelect(option.key);
      }}
      initial={false}
      whileHover={disabled ? undefined : {
        y: -6,
        transition: { type: "spring", stiffness: 400, damping: 15 },
      }}
      whileTap={disabled ? undefined : { scale: 0.95 }}
      className={cn(
        "group relative w-full overflow-hidden rounded-3xl border-2 p-0 text-left transition-all duration-300 focus:outline-none",
        selected
          ? cn("border-transparent ring-4 scale-[1.03] shadow-xl", style.ring, style.glow)
          : "border-transparent shadow-sm hover:shadow-md",
        disabled && "opacity-50 cursor-not-allowed",
      )}
    >
      {/* fundo gradiente sempre visível */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br transition-opacity duration-300",
        style.bg,
        selected ? "opacity-100" : "opacity-60 group-hover:opacity-90",
      )} />

      <div className="relative z-10 flex flex-col items-center text-center gap-2 px-3 py-5 sm:py-6">
        {/* Emoji */}
        <div className="relative">
          <motion.span
            animate={selected ? { scale: [1, 1.25, 1.1], rotate: [0, -12, 12, 0] } : { scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-4xl sm:text-5xl drop-shadow-md select-none block leading-none"
          >
            {option.emoji}
          </motion.span>

          <AnimatePresence>
            {selected && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute -top-1.5 -right-3 rounded-full bg-white p-0.5 shadow-lg z-20"
              >
                <CheckCircle2 className={cn("h-4 w-4", style.label)} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Texto */}
        <div className="space-y-0.5">
          <p className={cn(
            "text-sm sm:text-base font-black tracking-tight leading-none transition-colors duration-300",
            style.label,
          )}>
            {option.label}
          </p>
          <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground leading-tight">
            {option.description}
          </p>
        </div>
      </div>
    </motion.button>
  );
}
