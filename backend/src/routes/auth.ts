import { Router } from "express";
import passport from "passport";
import { googleEnabled } from "../config/passport";
import "../config/passport"; // register the Google strategy (if configured)
import * as authController from "../controllers/authController";
import { authenticate } from "../middleware/auth";
import { authLimiter } from "../middleware/rateLimiter";
import { registerValidators, loginValidators, validate } from "../middleware/validation";
import { loginSocial } from "../services/AuthService";
import { env } from "../config/env";

const router = Router();

router.post("/register",        authLimiter, registerValidators, validate, authController.register);
router.post("/login",           authLimiter, loginValidators,    validate, authController.login);
router.post("/refresh",         authLimiter, authController.refresh);
router.post("/logout",          authController.logout);
router.get("/me",               authenticate, authController.me);
router.post("/forgot-password", authLimiter, authController.forgotPassword);
router.post("/reset-password",  authLimiter, authController.resetPassword);

// ── Google OAuth ──────────────────────────────────────────────────
if (googleEnabled) {
  router.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"], session: false }),
  );

  router.get(
    "/google/callback",
    passport.authenticate("google", { session: false, failureRedirect: `${env.frontendUrl}/login?error=google_auth_failed` }),
    async (req, res) => {
      try {
        const prismaUser = req.user as { id: string; email: string; role: string };
        const { accessToken, refreshToken } = await loginSocial(prismaUser);
        res.redirect(
          `${env.frontendUrl}/auth/google/callback?` +
          `access_token=${encodeURIComponent(accessToken)}&` +
          `refresh_token=${encodeURIComponent(refreshToken)}`,
        );
      } catch {
        res.redirect(`${env.frontendUrl}/login?error=google_auth_failed`);
      }
    },
  );
} else {
  router.get("/google",          (_req, res) => res.status(501).json({ error: "Google OAuth não configurado" }));
  router.get("/google/callback", (_req, res) => res.redirect(`${env.frontendUrl}/login?error=google_not_configured`));
}

export default router;
