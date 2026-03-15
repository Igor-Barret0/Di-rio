"use client";

import * as React from "react";
import { apiFetch, getStoredTokens } from "@/lib/api/client";

export interface ChatMessage {
  id: string;
  conversationId: string;
  role: "user" | "assistant";
  content: string;
  tokens?: number | null;
  createdAt: string;
}

export interface ChatConversation {
  id: string;
  title: string | null;
  updatedAt: string;
  createdAt: string;
  _count?: { messages: number };
  messages?: Pick<ChatMessage, "content" | "role" | "createdAt">[];
}

export type RiskLevel = "NONE" | "LOW" | "MEDIUM" | "HIGH";

interface SendMessageResult {
  message: ChatMessage;
  riskLevel: RiskLevel;
  model?: string;
  cached?: boolean;
}

export function useChat() {
  const [conversations, setConversations] = React.useState<ChatConversation[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [activeMessages, setActiveMessages] = React.useState<ChatMessage[]>([]);
  const [sending, setSending] = React.useState(false);
  const [lastRiskLevel, setLastRiskLevel] = React.useState<RiskLevel>("NONE");

  const refreshConversations = React.useCallback(async () => {
    if (!getStoredTokens()) { setLoading(false); return; }
    try {
      const result = await apiFetch<{ conversations: ChatConversation[] }>("/chat?limit=30");
      setConversations(result.conversations);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { refreshConversations(); }, [refreshConversations]);

  const openConversation = React.useCallback(async (id: string) => {
    setActiveId(id);
    try {
      const conv = await apiFetch<{ id: string; title: string | null; messages: ChatMessage[] }>(`/chat/${id}`);
      setActiveMessages(conv.messages);
    } catch {
      setActiveMessages([]);
    }
  }, []);

  const createConversation = React.useCallback(async (): Promise<ChatConversation> => {
    const conv = await apiFetch<ChatConversation>("/chat", {
      method: "POST",
      body: JSON.stringify({}),
    });
    setConversations((prev) => [conv, ...prev]);
    setActiveId(conv.id);
    setActiveMessages([]);
    return conv;
  }, []);

  const sendMessage = React.useCallback(async (content: string) => {
    if (!content.trim()) return;

    let convId = activeId;
    if (!convId) {
      const conv = await createConversation();
      convId = conv.id;
    }

    // Optimistic user message
    const tempId = `temp-${Date.now()}`;
    const tempMsg: ChatMessage = {
      id: tempId,
      conversationId: convId,
      role: "user",
      content,
      createdAt: new Date().toISOString(),
    };
    setActiveMessages((prev) => [...prev, tempMsg]);
    setSending(true);

    try {
      const { message: assistantMsg, riskLevel } = await apiFetch<SendMessageResult>(
        `/chat/${convId}/messages`,
        { method: "POST", body: JSON.stringify({ content }) },
      );
      setActiveMessages((prev) => [...prev, assistantMsg]);
      setLastRiskLevel(riskLevel);
      await refreshConversations();
    } catch {
      setActiveMessages((prev) => prev.filter((m) => m.id !== tempId));
      throw new Error("Erro ao enviar mensagem.");
    } finally {
      setSending(false);
    }
  }, [activeId, createConversation, refreshConversations]);

  const deleteConversation = React.useCallback(async (id: string) => {
    await apiFetch(`/chat/${id}`, { method: "DELETE" });
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeId === id) {
      setActiveId(null);
      setActiveMessages([]);
    }
  }, [activeId]);

  const resetActive = React.useCallback(() => {
    setActiveId(null);
    setActiveMessages([]);
    setLastRiskLevel("NONE");
  }, []);

  return {
    conversations,
    loading,
    activeId,
    activeMessages,
    sending,
    lastRiskLevel,
    openConversation,
    createConversation,
    sendMessage,
    deleteConversation,
    resetActive,
    refreshConversations,
  };
}
