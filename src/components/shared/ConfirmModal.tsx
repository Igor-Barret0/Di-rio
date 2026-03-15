"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = "Confirmar",
  onClose,
  onConfirm,
  loading,
}: ConfirmModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-xs p-0 overflow-hidden rounded-3xl border-none shadow-2xl bg-white dark:bg-card"
      >
        <div className="flex flex-col items-center gap-5 px-7 py-8">
          {/* Ícone */}
          <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center">
            <AlertTriangle className="h-7 w-7 text-rose-500" />
          </div>

          {/* Texto */}
          <div className="text-center space-y-1.5">
            <h2 className="text-xl font-black text-foreground">{title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
          </div>

          {/* Ações */}
          <div className="w-full space-y-2 pt-1">
            <button
              onClick={onConfirm}
              disabled={loading}
              className="w-full h-12 rounded-2xl bg-rose-500 hover:bg-rose-600 disabled:opacity-60 text-white font-black text-sm transition-colors shadow-lg shadow-rose-500/25"
            >
              {loading ? "Aguarde..." : confirmLabel}
            </button>
            <button
              onClick={onClose}
              disabled={loading}
              className="w-full h-10 rounded-2xl text-sm font-bold text-muted-foreground hover:bg-muted transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}