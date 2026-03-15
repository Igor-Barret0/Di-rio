import { Router } from "express";
import * as notificationController from "../controllers/notificationController";
import { authenticate } from "../middleware/auth";

const router = Router();

router.use(authenticate);

router.get("/",           notificationController.listNotifications);
router.delete("/",        notificationController.deleteAll);
router.patch("/read-all", notificationController.markAllAsRead);
router.patch("/:id/read", notificationController.markAsRead);

export default router;
