import { prisma } from "../config/database";
import { hashPassword, comparePassword, generateToken } from "../utils/crypto";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt";
import { AppError } from "../middleware/errorHandler";
import { JwtPayload } from "../types";
import { sendWelcome, sendPasswordReset, sendSocialLoginReminder } from "./EmailService";
import { redis } from "../config/redis";
import { logger } from "../config/logger";
import { normalizeEmail } from "../utils/formatters";

const RESET_TTL = 60 * 60; // 1 hour

interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

export async function register(input: RegisterInput) {
  const email = normalizeEmail(input.email);
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new AppError(409, "E-mail já cadastrado");

  const passwordHash = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email,
      passwordHash,
      profile: { create: {} },
    },
    include: { profile: true },
  });

  const tokens = await generateTokens(user);

  // Fire-and-forget — don't block the response
  sendWelcome(user.email, user.name).catch(() => null);

  return { user: sanitizeUser(user), ...tokens };
}

export async function login(input: LoginInput) {
  const email = normalizeEmail(input.email);
  const user = await prisma.user.findUnique({
    where: { email },
    include: { profile: true },
  });

  if (!user || !user.passwordHash) throw new AppError(401, "E-mail ou senha incorretos");
  if (!user.isActive) throw new AppError(403, "Conta desativada");

  const valid = await comparePassword(input.password, user.passwordHash);
  if (!valid) throw new AppError(401, "E-mail ou senha incorretos");

  const tokens = await generateTokens(user);
  return { user: sanitizeUser(user), ...tokens };
}

export async function refresh(token: string) {
  let payload: JwtPayload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw new AppError(401, "Token de atualização inválido");
  }

  const stored = await prisma.refreshToken.findUnique({ where: { token } });
  if (!stored || stored.expiresAt < new Date()) {
    throw new AppError(401, "Token de atualização expirado ou não encontrado");
  }

  // Rotate: delete old, issue new pair
  await prisma.refreshToken.deleteMany({ where: { token } });

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user || !user.isActive) throw new AppError(401, "Usuário não encontrado");

  return generateTokens(user);
}

export async function logout(token: string) {
  await prisma.refreshToken.deleteMany({ where: { token } });
}

export async function logoutAll(userId: string) {
  await prisma.refreshToken.deleteMany({ where: { userId } });
}

export async function forgotPassword(email: string): Promise<void> {
  const normalized = normalizeEmail(email);
  const user = await prisma.user.findUnique({ where: { email: normalized } });

  // Always respond with success to avoid email enumeration attacks
  if (!user) {
    logger.debug("forgotPassword: e-mail não encontrado na base", { email });
    return;
  }
  if (!user.isActive) {
    logger.debug("forgotPassword: conta inativa", { email });
    return;
  }
  if (!user.passwordHash) {
    sendSocialLoginReminder(user.email, user.name).catch(() => null);
    return;
  }

  const token = generateToken(32);
  await redis.setex(`pwd_reset:${token}`, RESET_TTL, user.id);
  logger.debug("forgotPassword: token gerado, disparando e-mail", { email });

  // Fire-and-forget — log failures instead of silently discarding
  sendPasswordReset(user.email, user.name, token).catch((err) =>
    logger.error("Failed to send password reset email", {
      to: user.email,
      errMessage: err instanceof Error ? err.message : String(err),
    }),
  );
}

export async function loginSocial(user: { id: string; email: string; role: string }) {
  const tokens = await generateTokens(user);
  return { ...tokens };
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  const key = `pwd_reset:${token}`;
  const userId = await redis.get(key);

  if (!userId) throw new AppError(400, "Link inválido ou expirado");

  if (newPassword.length < 8) {
    throw new AppError(422, "A senha deve ter pelo menos 8 caracteres");
  }

  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });

  await redis.del(key);
  await prisma.refreshToken.deleteMany({ where: { userId } });
}

async function generateTokens(user: { id: string; email: string; role: string }) {
  const payload: JwtPayload = { userId: user.id, email: user.email, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  await prisma.refreshToken.create({
    data: { userId: user.id, token: refreshToken, expiresAt },
  });

  return { accessToken, refreshToken };
}

function sanitizeUser(user: Record<string, unknown>) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, ...safe } = user;
  return safe;
}
