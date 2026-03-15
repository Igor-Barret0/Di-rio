import { Router } from "express";
import * as moodController from "../controllers/moodController";
import { authenticate } from "../middleware/auth";
import { moodValidators, validate } from "../middleware/validation";

const router = Router();

router.use(authenticate);

router.post("/",      moodValidators, validate, moodController.createOrUpdate);
router.get("/",       moodController.list);
router.get("/stats",  moodController.stats);
router.get("/:date",  moodController.getByDate);
router.delete("/:id", moodController.remove);

export default router;
