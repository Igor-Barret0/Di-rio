import rateLimit from "express-rate-limit";
import { env } from "../config/env";

export const rateLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Muitas requisições. Tente novamente mais tarde." },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: env.nodeEnv === "development" ? 100 : 10,
  message: { error: "Muitas tentativas de acesso. Tente novamente em 15 minutos." },
});
