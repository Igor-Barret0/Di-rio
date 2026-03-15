"use client";

import * as React from "react";
import { LogOut } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface LogoutModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function LogoutModal({ open, onClose, onConfirm }: LogoutModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-xs p-0 overflow-hidden rounded-3xl border-none shadow-2xl bg-white dark:bg-card"
      >
        <div className="flex flex-col items-center gap-5 px-7 py-8">
          {/* Ícone */}
          <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center">
            <LogOut className="h-7 w-7 text-rose-500" />
          </div>

          {/* Texto */}
          <div className="text-center space-y-1.5">
            <h2 className="text-xl font-black text-foreground">Sair do sistema</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Tem certeza que deseja sair da sua conta?
            </p>
          </div>

          {/* Ações */}
          <div className="w-full space-y-2 pt-1">
            <button
              onClick={onConfirm}
              className="w-full h-12 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-black text-sm transition-colors shadow-lg shadow-rose-500/25"
            >
              Sair
            </button>
            <button
              onClick={onClose}
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