import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/database";
import { AppError } from "../middleware/errorHandler";
import { pageMetadata } from "../utils/formatters";

// ── Global stats ──────────────────────────────────────────────────────────────

export async function getGlobalStats(req: Request, res: Response, next: NextFunction) {
  try {
    const todayISO = new Date().toISOString().slice(0, 10);

    const [totalUsers, totalMoods, totalAssessments, highRiskCount, activeToday] =
      await Promise.all([
        prisma.user.count({ where: { isActive: true } }),
        prisma.moodRecord.count(),
        prisma.assessment.count(),
        prisma.assessment.count({ where: { riskLevel: "HIGH" } }),
        prisma.moodRecord.count({ where: { dateISO: todayISO } }),
      ]);

    const moodRecords = await prisma.moodRecord.findMany({ select: { mood: true } });
    const moodFrequency: Record<string, number> = {};
    for (const r of moodRecords) {
      moodFrequency[r.mood] = (moodFrequency[r.mood] ?? 0) + 1;
    }

    const riskBreakdown = await prisma.assessment.groupBy({
      by: ["riskLevel"],
      _count: { id: true },
    });

    const roleBreakdown = await prisma.user.groupBy({
      by: ["role"],
      _count: { id: true },
    });

    // Recent high-risk assessments
    const recentHighRisk = await prisma.assessment.findMany({
      where: { riskLevel: "HIGH" },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    res.json({
      totalUsers,
      totalMoods,
      totalAssessments,
      highRiskCount,
      activeToday,
      moodFrequency,
      riskBreakdown: riskBreakdown.map((r) => ({ riskLevel: r.riskLevel, count: r._count.id })),
      roleBreakdown: roleBreakdown.map((r) => ({ role: r.role, count: r._count.id })),
      recentHighRisk,
    });
  } catch (err) {
    next(err);
  }
}

// ── List all users ────────────────────────────────────────────────────────────

export async function listUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const { page = 1, limit = 20, search, role } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: "insensitive" } },
        { email: { contains: String(search), mode: "insensitive" } },
      ];
    }
    if (role) where.role = role;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: Number(limit),
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          plan: true,
          isActive: true,
          createdAt: true,
          _count: { select: { moodRecords: true, assessments: true, goals: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({ users, meta: pageMetadata(total, Number(page), Number(limit)) });
  } catch (err) {
    next(err);
  }
}

// ── Get user detail ───────────────────────────────────────────────────────────

export async function getUserDetail(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        userBadges: { include: { badge: true }, orderBy: { unlockedAt: "desc" } },
        _count: {
          select: { moodRecords: true, assessments: true, goals: true, conversations: true },
        },
      },
    });
    if (!user) return next(new AppError(404, "Usuário não encontrado"));
    const { passwordHash, ...safe } = user;

    const [recentMoods, recentAssessments, goals] = await Promise.all([
      prisma.moodRecord.findMany({
        where: { userId: id },
        orderBy: { dateISO: "desc" },
        take: 14,
      }),
      prisma.assessment.findMany({
        where: { userId: id },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.goal.findMany({
        where: { userId: id },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    res.json({ ...safe, recentMoods, recentAssessments, goals });
  } catch (err) {
    next(err);
  }
}

// ── Get user moods ────────────────────────────────────────────────────────────

export async function getUserMoods(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { page = 1, limit = 30 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [records, total] = await Promise.all([
      prisma.moodRecord.findMany({
        where: { userId: id },
        orderBy: { dateISO: "desc" },
        skip,
        take: Number(limit),
      }),
      prisma.moodRecord.count({ where: { userId: id } }),
    ]);

    res.json({ records, meta: pageMetadata(total, Number(page), Number(limit)) });
  } catch (err) {
    next(err);
  }
}

// ── Get user assessments ──────────────────────────────────────────────────────

export async function getUserAssessments(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    const assessments = await prisma.assessment.findMany({
      where: { userId: id },
      orderBy: { createdAt: "desc" },
    });

    res.json({ assessments, total: assessments.length });
  } catch (err) {
    next(err);
  }
}

// ── Update user ───────────────────────────────────────────────────────────────

export async function updateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { role, isActive } = req.body;

    if (id === req.user!.userId && role && role !== req.user!.role) {
      return next(new AppError(400, "Não é possível alterar seu próprio cargo"));
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(role !== undefined && { role }),
        ...(isActive !== undefined && { isActive }),
      },
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });

    res.json(user);
  } catch (err) {
    next(err);
  }
}

// ── Delete user ───────────────────────────────────────────────────────────────

export async function deleteUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    if (id === req.user!.userId) {
      return next(new AppError(400, "Não é possível excluir sua própria conta"));
    }

    await prisma.user.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

// ── Resources CRUD ────────────────────────────────────────────────────────────

export async function listAllResources(req: Request, res: Response, next: NextFunction) {
  try {
    const resources = await prisma.resource.findMany({ orderBy: { name: "asc" } });
    res.json(resources);
  } catch (err) {
    next(err);
  }
}

export async function createResource(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, description, phone, url, type } = req.body;
    if (!name || !description || !type) {
      return next(new AppError(400, "name, description e type são obrigatórios"));
    }
    const resource = await prisma.resource.create({
      data: { name, description, phone: phone || null, url: url || null, type },
    });
    res.status(201).json(resource);
  } catch (err) {
    next(err);
  }
}

export async function updateResource(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { name, description, phone, url, type, isActive } = req.body;
    const resource = await prisma.resource.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(phone !== undefined && { phone }),
        ...(url !== undefined && { url }),
        ...(type !== undefined && { type }),
        ...(isActive !== undefined && { isActive }),
      },
    });
    res.json(resource);
  } catch (err) {
    next(err);
  }
}

export async function deleteResource(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    await prisma.resource.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
