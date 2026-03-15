import { Router } from "express";
import * as adminController from "../controllers/adminController";
import { authenticate, requireRole } from "../middleware/auth";

const router = Router();

router.use(authenticate);
router.use(requireRole("ADMIN", "COUNSELOR"));

// ── Stats ─────────────────────────────────────────────────
router.get("/stats", adminController.getGlobalStats);

// ── Users ─────────────────────────────────────────────────
router.get  ("/users",                adminController.listUsers);
router.get  ("/users/:id",            adminController.getUserDetail);
router.get  ("/users/:id/moods",      adminController.getUserMoods);
router.get  ("/users/:id/assessments", adminController.getUserAssessments);
router.patch("/users/:id",            adminController.updateUser);
router.delete("/users/:id",           adminController.deleteUser);

// ── Resources ─────────────────────────────────────────────
router.get   ("/resources",     adminController.listAllResources);
router.post  ("/resources",     adminController.createResource);
router.patch ("/resources/:id", adminController.updateResource);
router.delete("/resources/:id", adminController.deleteResource);

export default router;
