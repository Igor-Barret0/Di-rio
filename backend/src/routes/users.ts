import { Router } from "express";
import * as userController from "../controllers/userController";
import { authenticate } from "../middleware/auth";
import { changePasswordValidators, validate } from "../middleware/validation";

const router = Router();

router.use(authenticate);

// /me/stats must come before /me to avoid route conflict
router.get("/me/stats",      userController.getStats);
router.get("/me",            userController.getProfile);
router.patch("/me",          userController.updateProfile);
router.patch("/me/password", changePasswordValidators, validate, userController.changePassword);
router.delete("/me",         userController.deleteAccount);

export default router;
