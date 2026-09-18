import type { NextFunction, Request, Response } from "express";
import type { UserRole } from "@prisma/client";
import { getAuthentication, readCookie, sessionCookieName } from "./session.js";

function apiError(res: Response, status: number, code: string, message: string): void {
  res.status(status).json({ error: { code, message } });
}

export async function loadAuthentication(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const token = readCookie(req.header("cookie"), sessionCookieName());
    if (token) req.auth = await getAuthentication(token) ?? undefined;
    next();
  } catch (error) {
    next(error);
  }
}

export function requireAuthentication(req: Request, res: Response, next: NextFunction): void {
  if (!req.auth) {
    apiError(res, 401, "UNAUTHENTICATED", "Authentication is required.");
    return;
  }
  next();
}

export function requirePasswordChangeCompleted(req: Request, res: Response, next: NextFunction): void {
  if (req.auth?.user.mustChangePassword) {
    apiError(res, 403, "PASSWORD_CHANGE_REQUIRED", "A password change is required before using this resource.");
    return;
  }
  next();
}

export function requireRoles(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.auth) {
      apiError(res, 401, "UNAUTHENTICATED", "Authentication is required.");
      return;
    }
    if (!roles.includes(req.auth.user.role)) {
      apiError(res, 403, "FORBIDDEN", "You do not have permission to use this resource.");
      return;
    }
    next();
  };
}

// Browser requests carrying cookies must come from the configured frontend.
// Requests without Origin (for example server-to-server tools) are permitted;
// authentication and role checks remain mandatory for protected resources.
export function requireTrustedOrigin(req: Request, res: Response, next: NextFunction): void {
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    next();
    return;
  }
  const origin = req.header("origin");
  const allowedOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
  if (origin && origin !== allowedOrigin) {
    apiError(res, 403, "INVALID_ORIGIN", "Request origin is not allowed.");
    return;
  }
  next();
}
