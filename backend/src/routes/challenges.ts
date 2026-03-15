import { Router } from "express";
import * as challengeController from "../controllers/challengeController";
import { authenticate } from "../middleware/auth";

const router = Router();

router.use(authenticate);

router.get("/",              challengeController.listChallenges);
router.get("/me",            challengeController.getMyProgress);
router.post("/:id/join",     challengeController.joinChallenge);
router.delete("/:id/join",   challengeController.leaveChallenge);
router.post("/:id/progress", challengeController.logProgress);

export default router;
