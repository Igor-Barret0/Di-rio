import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { prisma } from "./database";
import { env } from "./env";
import { normalizeEmail } from "../utils/formatters";

export const googleEnabled = !!(env.google.clientId && env.google.clientSecret);

if (googleEnabled) {
  passport.use(
    new GoogleStrategy(
      {
        clientID:     env.google.clientId,
        clientSecret: env.google.clientSecret,
        callbackURL:  env.google.callbackUrl,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const rawEmail = profile.emails?.[0]?.value;
          if (!rawEmail) return done(new Error("E-mail não encontrado no perfil Google"));
          const email = normalizeEmail(rawEmail);

          // Find by googleId first, then by email (connects existing account)
          let user = await prisma.user.findFirst({
            where: { OR: [{ googleId: profile.id }, { email }] },
          });

          if (user) {
            // Update googleId if missing (first Google login on existing email account)
            if (!user.googleId) {
              user = await prisma.user.update({
                where: { id: user.id },
                data: {
                  googleId:  profile.id,
                  avatarUrl: user.avatarUrl ?? profile.photos?.[0]?.value,
                },
              });
            }
          } else {
            user = await prisma.user.create({
              data: {
                email,
                name:      profile.displayName ?? email.split("@")[0],
                googleId:  profile.id,
                avatarUrl: profile.photos?.[0]?.value ?? null,
                profile:   { create: {} },
              },
            });
          }

          return done(null, { userId: user.id, email: user.email, role: user.role });
        } catch (err) {
          return done(err as Error);
        }
      },
    ),
  );
}

export default passport;
