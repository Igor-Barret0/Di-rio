import { Request, Response, NextFunction } from "express";
import * as AuthService from "../services/AuthService";
import { AppError } from "../middleware/errorHandler";
import { prisma } from "../config/database";

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await AuthService.register(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await AuthService.login(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return next(new AppError(400, "Token de atualização obrigatório"));
    const tokens = await AuthService.refresh(refreshToken);
    res.json(tokens);
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) await AuthService.logout(refreshToken);
    res.json({ message: "Sessão encerrada com sucesso" });
  } catch (err) {
    next(err);
  }
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      include: { profile: true },
    });

    if (!user) return next(new AppError(404, "Usuário não encontrado"));

    const { passwordHash, ...safe } = user as Record<string, unknown>;

    const xpResult = await prisma.xPTransaction.aggregate({
      where: { userId: user.id },
      _sum: { amount: true },
    });

    res.json({ ...safe, totalXP: xpResult._sum.amount ?? 0 });
  } catch (err) {
    next(err);
  }
}

export async function forgotPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = req.body;
    if (!email) return next(new AppError(400, "E-mail é obrigatório"));

    await AuthService.forgotPassword(email);

    // Always return 200 — don't reveal if email exists
    res.json({ message: "Se esse e-mail estiver cadastrado, você receberá um link para redefinir sua senha." });
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return next(new AppError(400, "Token e nova senha são obrigatórios"));
    }

    await AuthService.resetPassword(token, password);
    res.json({ message: "Senha atualizada com sucesso. Faça login novamente." });
  } catch (err) {
    next(err);
  }
}
