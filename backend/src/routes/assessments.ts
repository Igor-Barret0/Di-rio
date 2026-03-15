import { Router } from "express";
import * as assessmentController from "../controllers/assessmentController";
import { authenticate } from "../middleware/auth";

const router = Router();

router.use(authenticate);

router.post("/",          assessmentController.submitAssessment);
router.get("/",           assessmentController.listAssessments);
router.get("/latest/:type", assessmentController.getLatest);

export default router;
