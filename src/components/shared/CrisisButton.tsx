"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, X, MessageCircle, ExternalLink, Heart } from "lucide-react";

const RESOURCES = [
  {
    label: "CVV — Ligue Agora",
    number: "188",
    description: "Centro de Valorização da Vida • 24h gratuito",
    icon: Phone,
    href: "tel:188",
    gradient: "from-rose-500 to-pink-600",
    glow: "shadow-rose-500/40",
    accent: "bg-white/15",
  },
  {
    label: "Chat CVV",
    number: null,
    description: "Converse por texto agora mesmo",
    icon: MessageCircle,
    href: "https://www.cvv.org.br/chat/",
    gradient: "from-violet-500 to-purple-600",
    glow: "shadow-violet-500/40",
    accent: "bg-white/15",
  },
  {
    label: "CAPS — Saúde Mental",
    number: "156",
    description: "Serviço público de saúde mental gratuito",
    icon: Heart,
    href: "tel:156",
    gradient: "from-blue-500 to-cyan-600",
    glow: "shadow-blue-500/40",
    accent: "bg-white/15",
  },
];

export function CrisisButton() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="fixed bottom-24 right-4 sm:right-6 z-50 w-75 rounded-3xl overflow-hidden shadow-2xl shadow-black/40 ring-1 ring-white/10"
          >
            {/* Header */}
            <div className="relative bg-linear-to-br from-rose-600 via-rose-500 to-pink-600 px-5 pt-5 pb-6 overflow-hidden">
              {/* Decorative circles */}
              <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
              <div className="absolute -bottom-8 -left-4 w-20 h-20 rounded-full bg-white/8" />

              <div className="relative">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="inline-flex items-center gap-1 bg-white/20 text-white text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    Precisa de ajuda?
                  </span>
                </div>
                <h2 className="text-xl font-black text-white leading-tight">
                  Você não está<br />sozinho 💛
                </h2>
                <p className="text-xs text-white/75 font-medium mt-1.5">
                  Escolha como quer ser apoiado agora
                </p>
              </div>
            </div>

            {/* Resources */}
            <div className="bg-[#0f0f18] p-3 space-y-2">
              {RESOURCES.map((r, i) => {
                const Icon = r.icon;
                const isExternal = r.href.startsWith("http");
                return (
                  <motion.a
                    key={r.label}
                    href={r.href}
                    target={isExternal ? "_blank" : "_self"}
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className={`group relative flex items-center gap-3 w-full rounded-2xl px-4 py-3.5 text-white bg-linear-to-r ${r.gradient} shadow-lg ${r.glow} overflow-hidden transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]`}
                    onClick={() => setOpen(false)}
                  >
                    {/* Shine */}
                    <div className="absolute inset-0 bg-linear-to-b from-white/12 to-transparent pointer-events-none" />

                    {/* Icon circle */}
                    <div className={`relative shrink-0 w-9 h-9 rounded-xl ${r.accent} flex items-center justify-center`}>
                      <Icon className="h-4.5 w-4.5 text-white" />
                    </div>

                    <div className="flex-1 min-w-0 relative">
                      <p className="text-sm font-black leading-tight">{r.label}</p>
                      <p className="text-[11px] text-white/75 font-medium mt-0.5 leading-tight">{r.description}</p>
                    </div>

                    <div className="relative shrink-0">
                      {r.number ? (
                        <span className="bg-white/20 text-white text-sm font-black px-2.5 py-1 rounded-xl tabular-nums">
                          {r.number}
                        </span>
                      ) : (
                        <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center">
                          <ExternalLink className="h-3.5 w-3.5 text-white" />
                        </div>
                      )}
                    </div>
                  </motion.a>
                );
              })}
            </div>

            <div className="bg-[#0f0f18] pb-4 px-5">
              <p className="text-center text-[10px] text-white/25 font-medium">
                Todas as ligações são gratuitas e confidenciais
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <motion.button
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        animate={open ? {} : {
          boxShadow: [
            "0 0 0 0 rgba(220,38,38,0.5)",
            "0 0 0 14px rgba(220,38,38,0)",
          ],
        }}
        transition={open ? {} : {
          repeat: Infinity,
          duration: 2,
          ease: "easeOut",
        }}
        className="fixed bottom-6 right-4 sm:right-6 z-50 flex items-center gap-2 rounded-full bg-rose-600 px-4 py-3 text-white shadow-xl shadow-rose-600/40 hover:bg-rose-500 transition-colors"
        aria-label="Ajuda em crise"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="h-5 w-5" />
            </motion.span>
          ) : (
            <motion.span
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2"
            >
              <Phone className="h-5 w-5" />
              <span className="text-sm font-black">SOS 188</span>
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
}