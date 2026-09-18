import { createHash, randomBytes } from "node:crypto";
import type { Response } from "express";
import { getPrisma } from "../prisma.js";
import { toPublicUser, type AuthContext } from "./types.js";

const DEFAULT_SESSION_TTL_HOURS = 8;

function sessionTtlMilliseconds(): number {
  const configuredHours = Number(process.env.SESSION_TTL_HOURS ?? DEFAULT_SESSION_TTL_HOURS);
  const hours = Number.isFinite(configuredHours) && configuredHours > 0
    ? configuredHours
    : DEFAULT_SESSION_TTL_HOURS;
  return hours * 60 * 60 * 1000;
}

export function sessionCookieName(): string {
  return process.env.SESSION_COOKIE_NAME || "toktickit_session";
}

export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("base64url");
}

export async function createSession(userId: number): Promise<{ token: string; expiresAt: Date }> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + sessionTtlMilliseconds());

  await getPrisma().session.create({
    data: { tokenHash: hashSessionToken(token), userId, expiresAt },
  });

  return { token, expiresAt };
}

export function setSessionCookie(res: Response, token: string, expiresAt: Date): void {
  res.cookie(sessionCookieName(), token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  });
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(sessionCookieName(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}

export function readCookie(header: string | undefined, name: string): string | undefined {
  if (!header) return undefined;
  const prefix = `${name}=`;
  const value = header.split(";").map((part) => part.trim()).find((part) => part.startsWith(prefix));
  return value ? decodeURIComponent(value.slice(prefix.length)) : undefined;
}

export async function getAuthentication(token: string): Promise<AuthContext | null> {
  const session = await getPrisma().session.findFirst({
    where: {
      tokenHash: hashSessionToken(token),
      revokedAt: null,
      expiresAt: { gt: new Date() },
      user: { isActive: true },
    },
    include: { user: true },
  });

  if (!session) return null;
  return { sessionId: session.id, user: toPublicUser(session.user) };
}

export async function revokeSession(sessionId: number): Promise<void> {
  await getPrisma().session.updateMany({
    where: { id: sessionId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}
