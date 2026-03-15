import dotenv from "dotenv";
dotenv.config();

function required(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env var: ${key}`);
  return val;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 3001),
  apiUrl: process.env.API_URL ?? "http://localhost:3001",
  frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:3000",

  databaseUrl: required("DATABASE_URL"),
  redisUrl: process.env.REDIS_URL ?? "redis://localhost:6379",

  jwt: {
    secret: required("JWT_SECRET"),
    expiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
    refreshSecret: required("JWT_REFRESH_SECRET"),
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? "30d",
  },

  google: {
    clientId: process.env.GOOGLE_CLIENT_ID ?? "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    callbackUrl: process.env.GOOGLE_CALLBACK_URL ?? "http://localhost:3001/api/auth/google/callback",
  },

  geminiApiKey: process.env.GEMINI_API_KEY ?? "",
  openaiApiKey: process.env.OPENAI_API_KEY ?? "",

  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY ?? "",
    fromEmail: process.env.SENDGRID_FROM_EMAIL ?? "noreply@diarioemocional.com",
    fromName: process.env.SENDGRID_FROM_NAME ?? "Diário Emocional",
  },

  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
    bucket: process.env.AWS_S3_BUCKET ?? "",
    region: process.env.AWS_REGION ?? "us-east-1",
  },

  log: {
    level: process.env.LOG_LEVEL ?? (process.env.NODE_ENV === "production" ? "info" : "debug"),
    file: process.env.LOG_FILE ?? "logs/app.log",
  },

  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:3000",

  rateLimit: {
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 900_000),
    max: Number(process.env.RATE_LIMIT_MAX_REQUESTS ?? ((process.env.NODE_ENV ?? "development") === "development" ? 2000 : 100)),
  },

  isDev: (process.env.NODE_ENV ?? "development") === "development",
  isProd: process.env.NODE_ENV === "production",
};
