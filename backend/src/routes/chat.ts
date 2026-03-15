import { Router } from "express";
import * as chatController from "../controllers/chatController";
import { authenticate } from "../middleware/auth";

const router = Router();

router.use(authenticate);

router.get("/",          chatController.listConversations);
router.post("/",         chatController.createConversation);
router.get("/:id",       chatController.getConversation);
router.post("/:id/messages", chatController.sendMessage);
router.delete("/:id",    chatController.deleteConversation);

export default router;
