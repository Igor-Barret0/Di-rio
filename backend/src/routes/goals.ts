import { Router } from "express";
import * as goalController from "../controllers/goalController";
import { authenticate } from "../middleware/auth";

const router = Router();

router.use(authenticate);

router.get("/",    goalController.listGoals);
router.post("/",   goalController.createGoal);
router.patch("/:id", goalController.updateGoal);
router.delete("/:id", goalController.deleteGoal);

export default router;
