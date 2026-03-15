import Redis from "ioredis";
import { env } from "./env";
import { logger } from "./logger";

export const redis = new Redis(env.redisUrl, {
  retryStrategy: (times) => Math.min(times * 100, 3000),
  maxRetriesPerRequest: 3,
  lazyConnect: true,
});

redis.on("connect", () => logger.info("Redis connected"));
redis.on("error", (err) => logger.error("Redis error", { message: err.message }));
redis.on("reconnecting", () => logger.warn("Redis reconnecting..."));

export async function connectRedis(): Promise<void> {
  await redis.connect();
}
