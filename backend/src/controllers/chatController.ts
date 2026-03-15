import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/database";
import { AppError } from "../middleware/errorHandler";
import { generateResponse, ChatMessage, MoodContext } from "../services/AIService";
import { createNotification } from "../services/NotificationService";
import { NotificationType, RiskLevel } from "@prisma/client";
import { pageMetadata } from "../utils/formatters";

// ── Create a new conversation ─────────────────────────────────────────────────

export async function createConversation(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { title } = req.body;

    const conversation = await prisma.chatConversation.create({
      data: { userId, title: title ?? null },
    });

    res.status(201).json(conversation);
  } catch (err) {
    next(err);
  }
}

// ── List conversations ────────────────────────────────────────────────────────

export async function listConversations(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [conversations, total] = await Promise.all([
      prisma.chatConversation.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
        skip,
        take: Number(limit),
        include: {
          _count: { select: { messages: true } },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { content: true, role: true, createdAt: true },
          },
        },
      }),
      prisma.chatConversation.count({ where: { userId } }),
    ]);

    res.json({ conversations, meta: pageMetadata(total, Number(page), Number(limit)) });
  } catch (err) {
    next(err);
  }
}

// ── Get conversation with messages ───────────────────────────────────────────

export async function getConversation(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const conversation = await prisma.chatConversation.findUnique({
      where: { id },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });

    if (!conversation || conversation.userId !== userId) {
      return next(new AppError(404, "Conversa não encontrada"));
    }

    res.json(conversation);
  } catch (err) {
    next(err);
  }
}

// ── Send a message (calls AI) ─────────────────────────────────────────────────

export async function sendMessage(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { content } = req.body;

    if (!content?.trim()) {
      return next(new AppError(400, "O conteúdo da mensagem é obrigatório"));
    }

    // Verify conversation belongs to user
    const conversation = await prisma.chatConversation.findUnique({
      where: { id },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });

    if (!conversation || conversation.userId !== userId) {
      return next(new AppError(404, "Conversa não encontrada"));
    }

    // Persist the user message
    await prisma.chatMessage.create({
      data: { conversationId: id, role: "user", content },
    });

    // Build history for AI (max last 20 messages to control token usage)
    const history: ChatMessage[] = [
      ...conversation.messages.slice(-19),
      { role: "user", content },
    ].map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

    // Fetch mood context for a more personalised prompt
    const recentMoods = await prisma.moodRecord.findMany({
      where: { userId },
      orderBy: { dateISO: "desc" },
      take: 7,
      select: { mood: true },
    });

    const moodContext: MoodContext = {
      recentMoods: recentMoods.map((r) => r.mood),
      currentMood: recentMoods[0]?.mood,
    };

    // Call AI
    const aiResponse = await generateResponse(history, moodContext);

    // Persist AI reply
    const assistantMessage = await prisma.chatMessage.create({
      data: {
        conversationId: id,
        role: "assistant",
        content: aiResponse.message,
        tokens: aiResponse.tokens,
      },
    });

    // Auto-title first AI response (use first 60 chars of user message)
    if (!conversation.title && conversation.messages.length === 0) {
      await prisma.chatConversation.update({
        where: { id },
        data: { title: content.slice(0, 60) },
      });
    } else {
      // Touch updatedAt
      await prisma.chatConversation.update({ where: { id }, data: {} });
    }

    // Risk alert notification
    if (aiResponse.riskLevel === RiskLevel.HIGH) {
      await createNotification(
        userId,
        NotificationType.RISK_ALERT,
        "Estamos aqui por você",
        "Percebemos que você pode estar passando por um momento muito difícil. O CVV está disponível 24h pelo 188, de forma gratuita e sigilosa.",
        { riskLevel: aiResponse.riskLevel },
      );
    }

    res.json({
      message: assistantMessage,
      riskLevel: aiResponse.riskLevel,
      model: aiResponse.model,
      cached: aiResponse.cached,
    });
  } catch (err) {
    next(err);
  }
}

// ── Delete conversation ───────────────────────────────────────────────────────

export async function deleteConversation(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const conversation = await prisma.chatConversation.findUnique({ where: { id } });

    if (!conversation || conversation.userId !== userId) {
      return next(new AppError(404, "Conversa não encontrada"));
    }

    await prisma.chatConversation.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
