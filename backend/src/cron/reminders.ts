import cron from "node-cron";
import { prisma } from "../config/database";
import { logger } from "../config/logger";
import { createNotification } from "../services/NotificationService";
import { NotificationType } from "@prisma/client";
import { toDateISO } from "../utils/formatters";

export function startReminderCron() {
  // Runs every minute — checks if any user's reminder time matches current HH:MM (local)
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();
      const hhmm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const today = toDateISO();

      const profiles = await prisma.profile.findMany({
        where: {
          reminderEnabled: true,
          reminderTime: hhmm,
          user: { isActive: true },
        },
        select: { userId: true },
      });

      for (const profile of profiles) {
        const alreadyLogged = await prisma.moodRecord.findUnique({
          where: { userId_dateISO: { userId: profile.userId, dateISO: today } },
        });

        if (!alreadyLogged) {
          await createNotification(
            profile.userId,
            NotificationType.REMINDER,
            "Como você está hoje?",
            "Não se esqueça de registrar seu humor! Leva apenas 30 segundos. 😊",
          );
        }
      }
    } catch (err) {
      logger.error("Reminder cron error", { err });
    }
  });

  logger.info("Reminder cron started");
}
