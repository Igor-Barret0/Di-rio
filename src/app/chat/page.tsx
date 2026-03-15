"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useChat } from "@/hooks/useChat";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare, Plus, Send,
  AlertTriangle, ChevronLeft, Bot, Loader2,
  Sparkles, Zap, Heart, Brain,
  MoreHorizontal, Pin, PinOff, Pencil, Trash2, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getStoredTokens } from "@/lib/api/client";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";

/* ─── Helpers ── */
function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "agora";
  if (s < 3600) return `${Math.floor(s / 60)}min`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

function msgTime(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

/* ─── Local storage helpers ── */
const PINNED_KEY = "diario_chat_pinned_v1";
const RENAMED_KEY = "diario_chat_renamed_v1";

function loadPinned(): string[] {
  try { return JSON.parse(localStorage.getItem(PINNED_KEY) ?? "[]"); } catch { return []; }
}
function savePinned(ids: string[]) {
  localStorage.setItem(PINNED_KEY, JSON.stringify(ids));
}
function loadRenamed(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem(RENAMED_KEY) ?? "{}"); } catch { return {}; }
}
function saveRenamed(map: Record<string, string>) {
  localStorage.setItem(RENAMED_KEY, JSON.stringify(map));
}

/* ─── TypingDots ── */
function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 px-1 py-0.5">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="h-2 w-2 rounded-full bg-indigo-400/70"
          animate={{ y: [0, -5, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.18, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

/* ─── Quick prompts ── */
const QUICK_PROMPTS = [
  { icon: Heart,    label: "Como estou me sentindo",  text: "Quero refletir sobre como estou me sentindo hoje." },
  { icon: Brain,    label: "Ansiedade",               text: "Estou me sentindo ansioso. Pode me ajudar?" },
  { icon: Sparkles, label: "Técnica de respiração",   text: "Me ensina uma técnica de respiração para relaxar agora." },
  { icon: Zap,      label: "Motivação",               text: "Preciso de um impulso de motivação para hoje." },
];

/* ─── Página ── */
export default function ChatPage() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  React.useEffect(() => { setIsAuthenticated(!!getStoredTokens()); }, []);

  const {
    conversations, loading, activeId, activeMessages,
    sending, lastRiskLevel, openConversation, createConversation,
    sendMessage, deleteConversation,
  } = useChat();

  const [input, setInput] = React.useState("");
  const [showList, setShowList] = React.useState(true);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Three-dot menu state
  const [menuOpenId, setMenuOpenId] = React.useState<string | null>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Pin / Rename state
  const [pinnedIds, setPinnedIds] = React.useState<string[]>(() =>
    typeof window !== "undefined" ? loadPinned() : []
  );
  const [renamedTitles, setRenamedTitles] = React.useState<Record<string, string>>(() =>
    typeof window !== "undefined" ? loadRenamed() : {}
  );
  const [renamingId, setRenamingId] = React.useState<string | null>(null);
  const [renameValue, setRenameValue] = React.useState("");
  const renameInputRef = React.useRef<HTMLInputElement>(null);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = React.useState<{ id: string; title: string } | null>(null);

  // Close menu on outside click
  React.useEffect(() => {
    if (!menuOpenId) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpenId]);

  React.useEffect(() => {
    if (renamingId) setTimeout(() => renameInputRef.current?.focus(), 50);
  }, [renamingId]);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages, sending]);

  const handleSend = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || sending) return;
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    try { await sendMessage(content); }
    catch { toast.error("Erro ao enviar mensagem. Tente novamente."); }
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleNewConversation = async () => {
    try { await createConversation(); setShowList(false); }
    catch { toast.error("Erro ao criar conversa."); }
  };

  const handleOpen = async (id: string) => {
    await openConversation(id); setShowList(false);
  };

  // Pin toggle
  const handlePin = (id: string) => {
    const next = pinnedIds.includes(id) ? pinnedIds.filter(p => p !== id) : [id, ...pinnedIds];
    setPinnedIds(next);
    savePinned(next);
    setMenuOpenId(null);
    toast.success(pinnedIds.includes(id) ? "Chat desafixado." : "Chat fixado no topo.");
  };

  // Rename
  const handleRenameStart = (id: string, currentTitle: string) => {
    setRenamingId(id);
    setRenameValue(renamedTitles[id] ?? currentTitle);
    setMenuOpenId(null);
  };

  const handleRenameSave = (id: string) => {
    const trimmed = renameValue.trim();
    if (trimmed) {
      const next = { ...renamedTitles, [id]: trimmed };
      setRenamedTitles(next);
      saveRenamed(next);
      toast.success("Nome atualizado.");
    }
    setRenamingId(null);
  };

  // Delete
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteConversation(deleteTarget.id);
      // Remove from pinned/renamed
      const nextPinned = pinnedIds.filter(p => p !== deleteTarget.id);
      setPinnedIds(nextPinned); savePinned(nextPinned);
      const nextRenamed = { ...renamedTitles };
      delete nextRenamed[deleteTarget.id];
      setRenamedTitles(nextRenamed); saveRenamed(nextRenamed);
      toast.success("Conversa apagada.");
      setShowList(true);
    } catch { toast.error("Erro ao apagar conversa."); }
    finally { setDeleteTarget(null); }
  };

  // Sort: pinned first, then by updatedAt
  const sortedConversations = React.useMemo(() => {
    return [...conversations].sort((a, b) => {
      const aPin = pinnedIds.includes(a.id) ? 1 : 0;
      const bPin = pinnedIds.includes(b.id) ? 1 : 0;
      if (aPin !== bPin) return bPin - aPin;
      return b.updatedAt.localeCompare(a.updatedAt);
    });
  }, [conversations, pinnedIds]);

  const activeConv = conversations.find((c) => c.id === activeId);

  return (
    <AppShell>
      <div className="h-[calc(100vh-7.5rem)] flex gap-4">

        {/* ── Sidebar de conversas ── */}
        <div className={cn(
          "flex-col w-72 shrink-0 rounded-3xl overflow-hidden",
          "bg-[#0b0b14] border border-white/6 shadow-xl shadow-black/20",
          showList ? "flex" : "hidden md:flex",
        )}>
          {/* Header */}
          <div className="px-4 py-4 border-b border-white/6 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-linear-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-sm shadow-indigo-500/30">
                <MessageSquare className="w-3.5 h-3.5 text-white" />
              </div>
              <h2 className="text-sm font-black text-white tracking-tight">Conversas</h2>
            </div>
            <button
              onClick={handleNewConversation}
              disabled={!isAuthenticated}
              title="Nova conversa"
              className="w-7 h-7 rounded-xl bg-white/8 hover:bg-white/14 text-white/70 hover:text-white flex items-center justify-center transition-colors disabled:opacity-30"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Lista */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {!isAuthenticated ? (
              <p className="text-xs text-white/30 p-4 text-center">Faça login para usar o chat.</p>
            ) : loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-14 rounded-2xl bg-white/4 animate-pulse" />
              ))
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 px-4">
                <div className="w-12 h-12 rounded-2xl bg-white/4 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-white/20" />
                </div>
                <p className="text-xs text-white/30 text-center leading-relaxed">Nenhuma conversa ainda.</p>
                <button
                  onClick={handleNewConversation}
                  className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Iniciar primeira conversa
                </button>
              </div>
            ) : (
              sortedConversations.map((conv) => {
                const isActive = conv.id === activeId;
                const isPinned = pinnedIds.includes(conv.id);
                const isRenaming = renamingId === conv.id;
                const displayTitle = renamedTitles[conv.id] ?? conv.title ?? "Nova conversa";
                const lastMsg = conv.messages?.[0];

                return (
                  <div key={conv.id} className="relative">
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => !isRenaming && handleOpen(conv.id)}
                      onKeyDown={(e) => e.key === "Enter" && !isRenaming && handleOpen(conv.id)}
                      className={cn(
                        "w-full text-left px-3 py-2.5 rounded-2xl transition-all group cursor-pointer",
                        isActive ? "bg-indigo-500/15 ring-1 ring-indigo-500/25" : "hover:bg-white/5",
                      )}
                    >
                      <div className="flex items-center gap-2">
                        {isPinned && <Pin className="w-2.5 h-2.5 text-indigo-400 shrink-0" />}

                        {isRenaming ? (
                          <input
                            ref={renameInputRef}
                            value={renameValue}
                            onChange={e => setRenameValue(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === "Enter") handleRenameSave(conv.id);
                              if (e.key === "Escape") setRenamingId(null);
                            }}
                            onBlur={() => handleRenameSave(conv.id)}
                            onClick={e => e.stopPropagation()}
                            className="flex-1 bg-white/10 rounded-lg px-2 py-0.5 text-xs font-bold text-white outline-none border border-indigo-500/40 min-w-0"
                          />
                        ) : (
                          <p className={cn(
                            "text-xs font-bold truncate flex-1 leading-snug",
                            isActive ? "text-indigo-300" : "text-white/70",
                          )}>
                            {displayTitle}
                          </p>
                        )}

                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-[10px] text-white/20">{timeAgo(conv.updatedAt)}</span>

                          {/* Three-dot menu trigger */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setMenuOpenId(menuOpenId === conv.id ? null : conv.id);
                            }}
                            className="p-0.5 rounded-lg text-white/40 hover:text-white/80 transition-all"
                          >
                            <MoreHorizontal className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {!isRenaming && lastMsg && (
                        <p className="text-[11px] text-white/25 truncate mt-0.5 pl-0.5">
                          {lastMsg.role === "user" ? "Você: " : "IA: "}{lastMsg.content}
                        </p>
                      )}
                    </div>

                    {/* Dropdown menu */}
                    <AnimatePresence>
                      {menuOpenId === conv.id && (
                        <motion.div
                          ref={menuRef}
                          initial={{ opacity: 0, scale: 0.95, y: -4 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -4 }}
                          transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
                          className="absolute right-2 top-10 z-50 w-44 rounded-xl bg-[#161622] border border-white/10 shadow-2xl overflow-hidden"
                          onClick={e => e.stopPropagation()}
                        >
                          <button
                            onClick={() => handlePin(conv.id)}
                            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold text-white/70 hover:text-white hover:bg-white/8 transition-colors"
                          >
                            {isPinned ? <PinOff className="w-3.5 h-3.5 text-indigo-400" /> : <Pin className="w-3.5 h-3.5 text-indigo-400" />}
                            {isPinned ? "Desafixar" : "Fixar chat"}
                          </button>
                          <button
                            onClick={() => handleRenameStart(conv.id, displayTitle)}
                            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold text-white/70 hover:text-white hover:bg-white/8 transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5 text-amber-400" />
                            Renomear
                          </button>
                          <div className="h-px bg-white/6 mx-2" />
                          <button
                            onClick={() => {
                              setDeleteTarget({ id: conv.id, title: displayTitle });
                              setMenuOpenId(null);
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Apagar
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-white/6 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
              <p className="text-[10px] text-white/25 font-medium">Conversas privadas e seguras</p>
            </div>
          </div>
        </div>

        {/* ── Área principal de chat ── */}
        <div className={cn(
          "flex-col rounded-3xl overflow-hidden min-w-0 flex-1",
          "bg-card border border-border/50 shadow-sm",
          showList ? "hidden md:flex" : "flex",
        )}>
          {/* Header */}
          <div className="px-5 py-3.5 border-b border-border/40 flex items-center gap-3 shrink-0 bg-card">
            <button
              onClick={() => setShowList(true)}
              className="md:hidden p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/25">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-card shadow-sm" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-foreground tracking-tight truncate">
                {activeConv ? (renamedTitles[activeConv.id] ?? activeConv.title ?? "Assistente de Bem-Estar") : "Assistente de Bem-Estar"}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] text-emerald-500 font-semibold">● Online</span>
                <span className="text-[10px] text-muted-foreground/50">·</span>
                <span className="text-[10px] text-muted-foreground/50 font-medium">Powered by IA · Conversas privadas</span>
              </div>
            </div>

            {isAuthenticated && (
              <button
                onClick={handleNewConversation}
                className="h-8 px-3.5 rounded-xl bg-linear-to-r from-indigo-600 to-violet-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-500/25 hover:opacity-90 transition-opacity shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Novo</span>
              </button>
            )}
          </div>

          {/* Banner risco HIGH */}
          <AnimatePresence>
            {lastRiskLevel === "HIGH" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden shrink-0"
              >
                <div className="px-5 py-3 bg-rose-50 dark:bg-rose-950/30 border-b border-rose-200 dark:border-rose-900/40 flex gap-3 items-start">
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-rose-700 dark:text-rose-400 font-medium leading-relaxed">
                    Percebemos que você pode estar passando por um momento muito difícil.
                    O CVV está disponível 24h pelo <span className="font-black">188</span>, gratuito e sigiloso.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mensagens */}
          <div className="flex-1 overflow-y-auto px-5 py-5 bg-muted/10">
            {!isAuthenticated ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-3">
                  <div className="w-14 h-14 rounded-3xl bg-muted/50 flex items-center justify-center mx-auto">
                    <MessageSquare className="w-7 h-7 text-muted-foreground/30" />
                  </div>
                  <p className="text-sm font-bold text-muted-foreground">Faça login para usar o chat.</p>
                </div>
              </div>

            ) : !activeId ? (
              <div className="flex items-center justify-center h-full">
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="text-center space-y-6 max-w-sm w-full px-4"
                >
                  <div className="flex justify-center">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-3xl bg-linear-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-2xl shadow-indigo-500/30">
                        <Bot className="w-10 h-10 text-white" />
                      </div>
                      <motion.div
                        className="absolute inset-0 rounded-3xl bg-indigo-500/20"
                        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                      />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-foreground tracking-tight">Assistente de Bem-Estar</h3>
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                      Estou aqui para te ouvir e apoiar. Inicie uma conversa ou use um dos atalhos abaixo.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-left">
                    {QUICK_PROMPTS.map(({ icon: Icon, label, text }) => (
                      <button
                        key={label}
                        onClick={async () => { await createConversation(); setShowList(false); await sendMessage(text); }}
                        className="p-3 rounded-2xl bg-card border border-border/60 hover:border-indigo-300 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 transition-all text-left group shadow-sm"
                      >
                        <Icon className="w-4 h-4 text-indigo-500 mb-1.5" />
                        <p className="text-xs font-bold text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 leading-snug">{label}</p>
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={handleNewConversation}
                    className="w-full h-11 rounded-2xl bg-linear-to-r from-indigo-600 to-violet-600 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 hover:opacity-90 transition-opacity"
                  >
                    <Plus className="w-4 h-4" />
                    Nova conversa
                  </button>
                </motion.div>
              </div>

            ) : activeMessages.length === 0 && !sending ? (
              <div className="flex items-center justify-center h-full">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground font-medium">Conversa iniciada!</p>
                  <p className="text-xs text-muted-foreground/50">Diga olá para começar 👋</p>
                </motion.div>
              </div>

            ) : (
              <div className="space-y-3 max-w-3xl mx-auto">
                {activeMessages.map((msg, idx) => {
                  const isUser = msg.role === "user";
                  const prevMsg = idx > 0 ? activeMessages[idx - 1] : null;
                  const sameRole = prevMsg?.role === msg.role;
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                      className={cn("flex items-end gap-2.5", isUser ? "justify-end" : "justify-start")}
                    >
                      {!isUser && (
                        <div className={cn(
                          "w-7 h-7 rounded-xl bg-linear-to-br from-indigo-600 to-violet-600 flex items-center justify-center shrink-0 shadow-sm shadow-indigo-500/20",
                          sameRole ? "opacity-0" : "opacity-100",
                        )}>
                          <Bot className="w-3.5 h-3.5 text-white" />
                        </div>
                      )}
                      <div className={cn("flex flex-col gap-1", isUser ? "items-end" : "items-start", "max-w-[72%]")}>
                        <div className={cn(
                          "px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap",
                          isUser
                            ? "bg-linear-to-br from-indigo-600 to-violet-600 text-white rounded-2xl rounded-br-sm shadow-md shadow-indigo-500/20 font-medium"
                            : "bg-card border border-border/50 text-foreground rounded-2xl rounded-bl-sm shadow-sm",
                        )}>
                          {msg.content}
                        </div>
                        {msg.createdAt && (
                          <span className="text-[10px] text-muted-foreground/40 px-1">{msgTime(msg.createdAt)}</span>
                        )}
                      </div>
                      {isUser && (
                        <div className={cn(
                          "w-7 h-7 rounded-xl bg-muted/80 flex items-center justify-center shrink-0 text-xs font-black text-muted-foreground",
                          sameRole ? "opacity-0" : "opacity-100",
                        )}>
                          Eu
                        </div>
                      )}
                    </motion.div>
                  );
                })}

                {sending && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="flex items-end gap-2.5 justify-start"
                  >
                    <div className="w-7 h-7 rounded-xl bg-linear-to-br from-indigo-600 to-violet-600 flex items-center justify-center shrink-0 shadow-sm shadow-indigo-500/20">
                      <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                    </div>
                    <div className="bg-card border border-border/50 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                      <TypingDots />
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input */}
          {isAuthenticated && (
            <div className="px-4 py-3.5 border-t border-border/40 shrink-0 bg-card">
              <div className="relative flex items-end gap-2 bg-muted/40 border border-border/60 rounded-2xl px-3 py-2.5 focus-within:border-indigo-400/50 focus-within:ring-2 focus-within:ring-indigo-500/15 transition-all shadow-sm">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    e.target.style.height = "auto";
                    e.target.style.height = Math.min(e.target.scrollHeight, 144) + "px";
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Como você está se sentindo hoje? Escreva aqui… ✨"
                  disabled={sending || !activeId}
                  rows={1}
                  className="flex-1 resize-none bg-transparent text-sm font-medium placeholder:text-muted-foreground/40 focus:outline-none disabled:opacity-40 overflow-y-auto min-h-6"
                  style={{ lineHeight: "1.5rem", maxHeight: "144px" }}
                />
                <motion.button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || sending || !activeId}
                  whileTap={{ scale: 0.92 }}
                  className="w-9 h-9 rounded-xl bg-linear-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center shrink-0 disabled:opacity-30 disabled:cursor-not-allowed shadow-md shadow-indigo-500/25 hover:opacity-90 transition-opacity"
                >
                  <Send className="w-4 h-4" />
                </motion.button>
              </div>
              <p className="text-[10px] text-muted-foreground/30 text-center mt-2 font-medium">
                Shift+Enter para nova linha · Conversas privadas e seguras
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Delete confirmation modal ── */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
        <DialogContent className="sm:max-w-sm p-0 overflow-hidden rounded-3xl border-none shadow-2xl">
          <div className="px-6 pt-7 pb-5 text-center space-y-3">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center">
              <Trash2 className="w-7 h-7 text-rose-500" />
            </div>
            <div>
              <h2 className="text-lg font-black text-foreground">Confirmar exclusão</h2>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                Tem certeza que deseja apagar <span className="font-bold text-foreground">"{deleteTarget?.title}"</span>?<br />
                Essa ação não poderá ser desfeita.
              </p>
            </div>
          </div>
          <div className="px-6 pb-6 flex flex-col gap-2">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleDeleteConfirm}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-linear-to-br from-rose-500 to-red-600 text-white text-sm font-black shadow-lg shadow-rose-500/25 hover:opacity-90 transition-opacity"
            >
              <Trash2 className="w-4 h-4" /> Excluir
            </motion.button>
            <button
              onClick={() => setDeleteTarget(null)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-bold text-muted-foreground hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4" /> Cancelar
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}