"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown, AlertTriangle, Lightbulb, Phone, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PredictiveInsight } from "@/lib/analytics/predictive";

interface Props {
  insight: PredictiveInsight;
}

const CONFIG = {
  high: {
    bg: "bg-rose-50 dark:bg-rose-950/20",
    border: "border-rose-200 dark:border-rose-900/40",
    icon: AlertTriangle,
    iconColor: "text-rose-600",
    titleColor: "text-rose-700 dark:text-rose-400",
    label: "Atenção",
  },
  medium: {
    bg: "bg-amber-50 dark:bg-amber-950/20",
    border: "border-amber-200 dark:border-amber-900/40",
    icon: AlertTriangle,
    iconColor: "text-amber-600",
    titleColor: "text-amber-700 dark:text-amber-400",
    label: "Padrão detectado",
  },
  low: {
    bg: "bg-blue-50 dark:bg-blue-950/20",
    border: "border-blue-200 dark:border-blue-900/40",
    icon: Lightbulb,
    iconColor: "text-blue-600",
    titleColor: "text-blue-700 dark:text-blue-400",
    label: "Insight",
  },
  none: {
    bg: "bg-emerald-50 dark:bg-emerald-950/20",
    border: "border-emerald-200 dark:border-emerald-900/40",
    icon: TrendingUp,
    iconColor: "text-emerald-600",
    titleColor: "text-emerald-700 dark:text-emerald-400",
    label: "Evolução positiva",
  },
};

export function PredictiveInsightBanner({ insight }: Props) {
  const [dismissed, setDismissed] = React.useState(false);

  if (!insight.message) return null;

  const config = CONFIG[insight.riskLevel];
  const Icon = config.icon;

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8, height: 0 }}
          transition={{ duration: 0.3 }}
          className={cn(
            "rounded-2xl border p-4 flex gap-3 relative",
            config.bg,
            config.border
          )}
        >
          <div className={cn("shrink-0 mt-0.5", config.iconColor)}>
            <Icon className="h-5 w-5" />
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            <p className={cn("text-xs font-black uppercase tracking-widest", config.titleColor)}>
              {config.label}
            </p>
            <p className="text-sm font-bold text-foreground leading-snug">{insight.message}</p>
            {insight.suggestion && (
              <p className="text-xs font-medium text-muted-foreground leading-relaxed">
                💡 {insight.suggestion}
              </p>
            )}
            {insight.riskLevel === "high" && (
              <a
                href="tel:188"
                className="inline-flex items-center gap-1.5 mt-2 text-xs font-black text-rose-600 hover:underline"
              >
                <Phone className="h-3.5 w-3.5" /> Ligar para o CVV agora (188)
              </a>
            )}
          </div>

          <button
            onClick={() => setDismissed(true)}
            className="shrink-0 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors self-start"
            aria-label="Fechar"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
