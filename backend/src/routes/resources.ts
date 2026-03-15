import { Router } from "express";
import { prisma } from "../config/database";

const router = Router();

// Public endpoint — no authentication required
router.get("/", async (_req, res, next) => {
  try {
    const resources = await prisma.resource.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });
    res.json(resources);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const resource = await prisma.resource.findUnique({
      where: { id: req.params.id },
    });
    if (!resource || !resource.isActive) {
      res.status(404).json({ error: "Resource not found" });
      return;
    }
    res.json(resource);
  } catch (err) {
    next(err);
  }
});

export default router;
