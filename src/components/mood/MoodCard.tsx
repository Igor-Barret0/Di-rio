"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MoodOption } from "@/lib/moods/types";

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
  return (
    <motion.button
      type="button"
      disabled={disabled}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onSelect(option.key);
      }}
      style={{ borderRadius: '2.5rem' }}
      initial={false}
      whileHover={disabled ? undefined : { 
        y: -10, 
        transition: { type: "spring", stiffness: 400, damping: 15 }
      }}
      whileTap={disabled ? undefined : { scale: 0.96 }}
      className={cn(
        "group relative w-full overflow-hidden rounded-[2.5rem] border bg-white p-0 text-left transition-all duration-500 z-10",
        selected 
          ? "ring-4 ring-primary border-transparent shadow-2xl shadow-primary/20 scale-[1.02]" 
          : "border-transparent shadow-premium hover:shadow-premium-hover",
        disabled && "opacity-60 cursor-not-allowed",
      )}
    >
      <div className={cn(
        "p-6 flex flex-col h-full items-center text-center transition-all duration-500",
        option.colorClass,
        selected ? "opacity-100" : "opacity-40 group-hover:opacity-100"
      )}>
        <div className="flex flex-col items-center mb-4 relative">
          <motion.div 
            animate={selected ? { 
              scale: [1, 1.2, 1.1],
              rotate: [0, -10, 10, 0],
            } : { scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-6xl drop-shadow-xl select-none mb-3 transition-transform duration-500 group-hover:scale-110"
          >
            {option.emoji}
          </motion.div>
          
          <AnimatePresence>
            {selected && (
              <motion.div
                initial={{ scale: 0, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute -top-2 -right-4 rounded-full bg-primary p-1.5 text-white shadow-xl border-4 border-white z-20"
              >
                <CheckCircle2 className="h-4 w-4" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-1">
          <h3 className={cn(
            "text-xl font-black tracking-tighter leading-none transition-colors duration-300",
            selected ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
          )}>{option.label}</h3>
          <p className="text-[10px] font-bold text-muted-foreground/70 leading-relaxed max-w-32.5">
          {option.description}
          </p>
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            layoutId="active-glow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-primary/2 pointer-events-none"
          />
        )}
      </AnimatePresence>
    </motion.button>
  );
}
