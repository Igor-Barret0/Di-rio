import { GoogleGenerativeAI, Content } from "@google/generative-ai";
import OpenAI from "openai";
import crypto from "crypto";
import { env } from "../config/env";
import { logger } from "../config/logger";
import { redis } from "../config/redis";
import { detectRiskLevel } from "./RiskDetectionService";
import { RiskLevel } from "@prisma/client";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface MoodContext {
  recentMoods?: string[];   // last 7 moods
  currentMood?: string;
  streak?: number;
}

export interface AIResponse {
  message: string;
  model: "gemini" | "gpt-4" | "fallback";
  tokens?: number;
  riskLevel: RiskLevel;
  cached: boolean;
}

// ─── Fallback responses ───────────────────────────────────────────────────────

const FALLBACK_RESPONSES = [
  "Obrigado por compartilhar como você está se sentindo. Como você está agora?",
  "Entendo que pode ser difícil às vezes. Quer tentar uma respiração profunda juntos?",
  "Que bom que você está aqui. O que está passando pela sua cabeça agora?",
  "Estou aqui para ouvir. Você pode me contar mais sobre o que está sentindo?",
  "Cada dia é diferente, e tudo bem não estar bem. Como posso te ajudar hoje?",
];

// ─── System prompt builder ────────────────────────────────────────────────────

function buildSystemPrompt(context: MoodContext): string {
  const moodSummary = context.recentMoods?.length
    ? `Humores recentes (últimos registros): ${context.recentMoods.join(", ")}.`
    : "Sem registros de humor recentes.";

  const streakInfo = context.streak
    ? `O usuário está com uma sequência de ${context.streak} dia(s) registrando o humor.`
    : "";

  return `Você é um assistente de saúde mental compassivo, treinado em Terapia Cognitivo-Comportamental (TCC) e Terapia Comportamental Dialética (DBT).

Seu papel é:
1. Validar e compreender os sentimentos do usuário sem julgamentos
2. Oferecer suporte emocional empático e acolhedor
3. Sugerir técnicas práticas de coping quando apropriado (respiração, mindfulness, journaling)
4. NUNCA diagnosticar, prescrever medicações ou substituir um profissional de saúde mental
5. Em caso de risco imediato à vida, sempre mencionar o CVV: ligue 188 (24h, gratuito)

Contexto do usuário:
- ${moodSummary}
- Humor atual: ${context.currentMood ?? "não informado"}
- ${streakInfo}

Diretrizes de resposta:
- Seja breve e empático (3-4 frases no máximo)
- Use linguagem simples, acessível para adolescentes e jovens
- Nunca encerre a conversa abruptamente
- Sempre termine com uma pergunta aberta para continuar o diálogo
- Se o usuário mencionar automutilação ou suicídio, ofereça o CVV (188) com cuidado e empatia

Responda sempre em português brasileiro.`;
}

// ─── Gemini client ────────────────────────────────────────────────────────────

async function callGemini(
  messages: ChatMessage[],
  context: MoodContext,
): Promise<{ message: string; tokens: number }> {
  const genAI = new GoogleGenerativeAI(env.geminiApiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const systemPrompt = buildSystemPrompt(context);

  // Inject system prompt via a synthetic first exchange (v0.3.x workaround)
  const systemHistory: Content[] = [
    { role: "user",  parts: [{ text: systemPrompt }] },
    { role: "model", parts: [{ text: "Entendido. Estou pronto para apoiar o usuário com empatia e cuidado." }] },
  ];

  // Append the real conversation history (all but the last message)
  const conversationHistory: Content[] = messages.slice(0, -1).map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const chat = model.startChat({
    history: [...systemHistory, ...conversationHistory],
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 512,
    },
  });

  const lastMessage = messages[messages.length - 1].content;
  const result = await chat.sendMessage(lastMessage);
  const text = result.response.text();

  // Gemini doesn't return token counts reliably — estimate
  const tokens = Math.ceil((systemPrompt.length + text.length) / 4);

  return { message: text, tokens };
}

// ─── OpenAI client ────────────────────────────────────────────────────────────

async function callGPT(
  messages: ChatMessage[],
  context: MoodContext,
): Promise<{ message: string; tokens: number }> {
  const openai = new OpenAI({ apiKey: env.openaiApiKey });
  const systemPrompt = buildSystemPrompt(context);

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini", // cost-effective & capable
    messages: [
      { role: "system", content: systemPrompt },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ],
    temperature: 0.7,
    max_tokens: 512,
    presence_penalty: 0.1,
    frequency_penalty: 0.1,
  });

  const message = response.choices[0].message.content ?? "";
  const tokens = response.usage?.total_tokens ?? 0;

  return { message, tokens };
}

// ─── Cache helpers ────────────────────────────────────────────────────────────

const CACHE_TTL = 60 * 60; // 1 hour

function buildCacheKey(message: string, moodCtx: MoodContext): string {
  const hash = crypto
    .createHash("sha256")
    .update(message + JSON.stringify(moodCtx))
    .digest("hex")
    .slice(0, 16);
  return `ai:resp:${hash}`;
}

async function getCached(key: string): Promise<string | null> {
  try {
    return await redis.get(key);
  } catch {
    return null;
  }
}

async function setCache(key: string, value: string): Promise<void> {
  try {
    await redis.setex(key, CACHE_TTL, value);
  } catch {
    // Cache failures are non-critical
  }
}

// ─── Main entry point ─────────────────────────────────────────────────────────

export async function generateResponse(
  messages: ChatMessage[],
  context: MoodContext = {},
): Promise<AIResponse> {
  if (messages.length === 0) {
    return {
      message: FALLBACK_RESPONSES[0],
      model: "fallback",
      riskLevel: RiskLevel.NONE,
      cached: false,
    };
  }

  const lastUserMessage = messages[messages.length - 1].content;

  // Detect risk from the user's message before calling AI
  const riskLevel = detectRiskLevel(lastUserMessage);

  // Check Redis cache for identical short messages (saves API calls)
  const cacheKey = buildCacheKey(lastUserMessage, context);
  const cachedRaw = await getCached(cacheKey);
  if (cachedRaw) {
    logger.debug("AI response served from cache");
    return {
      message: cachedRaw,
      model: env.isDev ? "gemini" : "gpt-4",
      riskLevel,
      cached: true,
    };
  }

  const startTime = Date.now();

  try {
    let result: { message: string; tokens: number };
    let model: AIResponse["model"];

    if (env.isDev || !env.openaiApiKey) {
      if (!env.geminiApiKey) throw new Error("No AI API key configured");
      result = await callGemini(messages, context);
      model = "gemini";
    } else {
      result = await callGPT(messages, context);
      model = "gpt-4";
    }

    logger.info("AI response generated", {
      model,
      tokens: result.tokens,
      durationMs: Date.now() - startTime,
      riskLevel,
    });

    // Cache only low-risk responses to avoid storing sensitive content
    if (riskLevel === RiskLevel.NONE) {
      await setCache(cacheKey, result.message);
    }

    return {
      message: result.message,
      model,
      tokens: result.tokens,
      riskLevel,
      cached: false,
    };
  } catch (err) {
    logger.error("AI service error — using fallback", {
      errMessage: err instanceof Error ? err.message : String(err),
      errName: err instanceof Error ? err.name : "Unknown",
    });

    const fallback =
      riskLevel === RiskLevel.HIGH
        ? "Percebo que você pode estar passando por um momento muito difícil. O CVV está disponível 24h pelo número 188, de forma gratuita e sigilosa. Você não está sozinho(a)."
        : FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];

    return {
      message: fallback,
      model: "fallback",
      riskLevel,
      cached: false,
    };
  }
}
