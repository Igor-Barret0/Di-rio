import cron from "node-cron";
import { prisma } from "../config/database";
import { logger } from "../config/logger";
import { checkStreakBadges } from "../services/GamificationService";

export function startBadgeCron() {
  // Runs daily at midnight UTC — evaluates streak badges for all active users
  cron.schedule("0 0 * * *", async () => {
    try {
      const users = await prisma.user.findMany({
        where: { isActive: true },
        select: { id: true },
      });

      for (const user of users) {
        await checkStreakBadges(user.id);
      }

      logger.info(`Badge cron completed`, { userCount: users.length });
    } catch (err) {
      logger.error("Badge cron error", { err });
    }
  });

  logger.info("Badge cron started");
}
