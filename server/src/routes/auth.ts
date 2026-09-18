import { Router, type Request, type Response } from "express";
import { getPrisma } from "../prisma.js";
import { hashPassword, validatePassword, verifyPassword } from "../auth/password.js";
import { requireAuthentication, requireTrustedOrigin } from "../auth/middleware.js";
import { clearSessionCookie, createSession, revokeSession, setSessionCookie } from "../auth/session.js";
import { toPublicUser } from "../auth/types.js";

export const authRouter = Router();

function error(res: Response, status: number, code: string, message: string): Response {
  return res.status(status).json({ error: { code, message } });
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

authRouter.post("/login", requireTrustedOrigin, async (req: Request, res: Response) => {
  const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const password = typeof req.body.password === "string" ? req.body.password : "";

  if (!email || !isValidEmail(email) || !password.trim()) {
    return error(res, 401, "INVALID_CREDENTIALS", "Invalid email or password.");
  }

  try {
    const user = await getPrisma().user.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
    });

    if (!user || !user.isActive || !(await verifyPassword(password, user.passwordHash))) {
      return error(res, 401, "INVALID_CREDENTIALS", "Invalid email or password.");
    }

    const session = await createSession(user.id);
    setSessionCookie(res, session.token, session.expiresAt);
    return res.status(200).json({ user: toPublicUser(user) });
  } catch (cause) {
    console.error("Login failed:", cause);
    return error(res, 500, "AUTHENTICATION_UNAVAILABLE", "Unable to process login.");
  }
});

authRouter.post("/logout", requireTrustedOrigin, requireAuthentication, async (req: Request, res: Response) => {
  try {
    await revokeSession(req.auth!.sessionId);
    clearSessionCookie(res);
    return res.status(204).send();
  } catch (cause) {
    console.error("Logout failed:", cause);
    return error(res, 500, "LOGOUT_UNAVAILABLE", "Unable to log out.");
  }
});

authRouter.get("/me", requireAuthentication, (req: Request, res: Response) => {
  return res.status(200).json({ user: req.auth!.user });
});

authRouter.post("/change-password", requireTrustedOrigin, requireAuthentication, async (req: Request, res: Response) => {
  const currentPassword = typeof req.body.currentPassword === "string" ? req.body.currentPassword : "";
  const newPassword = typeof req.body.newPassword === "string" ? req.body.newPassword : "";
  const confirmPassword = typeof req.body.confirmPassword === "string" ? req.body.confirmPassword : "";
  const passwordError = validatePassword(newPassword);

  if (!currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword || passwordError) {
    return error(res, 400, "INVALID_PASSWORD_CHANGE", passwordError ?? "Password confirmation does not match.");
  }

  try {
    const user = await getPrisma().user.findUnique({ where: { id: req.auth!.user.id } });
    if (!user || !user.isActive || !(await verifyPassword(currentPassword, user.passwordHash))) {
      return error(res, 400, "INVALID_PASSWORD_CHANGE", "Current password is invalid.");
    }
    if (await verifyPassword(newPassword, user.passwordHash)) {
      return error(res, 400, "INVALID_PASSWORD_CHANGE", "New password must differ from the current password.");
    }

    const updatedUser = await getPrisma().user.update({
      where: { id: user.id },
      data: { passwordHash: await hashPassword(newPassword), mustChangePassword: false },
    });
    return res.status(200).json({ user: toPublicUser(updatedUser) });
  } catch (cause) {
    console.error("Password change failed:", cause);
    return error(res, 500, "PASSWORD_CHANGE_UNAVAILABLE", "Unable to change password.");
  }
});
