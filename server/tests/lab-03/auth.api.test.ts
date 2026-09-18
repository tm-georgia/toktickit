import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { UserRole } from "@prisma/client";
import app from "../../src/app.js";
import { hashPassword } from "../../src/auth/password.js";
import { getPrisma } from "../../src/prisma.js";

const prisma = getPrisma();
const password = "TestPassword123";
const email = `auth-test-${Date.now()}@example.test`;
const inactiveEmail = `auth-inactive-${Date.now()}@example.test`;
let userId: number;

beforeAll(async () => {
  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      name: "Authentication Test User",
      email,
      passwordHash,
      role: UserRole.REQUESTER,
      isActive: true,
      mustChangePassword: true,
    },
  });
  userId = user.id;

  await prisma.user.create({
    data: {
      name: "Inactive Authentication Test User",
      email: inactiveEmail,
      passwordHash,
      role: UserRole.REQUESTER,
      isActive: false,
      mustChangePassword: false,
    },
  });
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: { in: [email, inactiveEmail] } } });
  await prisma.$disconnect();
});

describe("Lab 3 authentication API", () => {
  it("rejects an unauthenticated protected ticket request", async () => {
    await request(app).get("/api/tickets").expect(401);
  });

  it("authenticates an active user without exposing password data", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({ email: email.toUpperCase(), password });

    expect(response.status).toBe(200);
    expect(response.headers["set-cookie"]).toBeDefined();
    expect(response.body).toEqual({
      user: expect.objectContaining({
        id: userId,
        email,
        role: UserRole.REQUESTER,
        mustChangePassword: true,
      }),
    });
    expect(JSON.stringify(response.body)).not.toContain("passwordHash");
  });

  it("uses the same safe error for an unknown or inactive account", async () => {
    const unknown = await request(app)
      .post("/auth/login")
      .send({ email: "unknown@example.test", password });
    const inactive = await request(app)
      .post("/auth/login")
      .send({ email: inactiveEmail, password });

    expect(unknown.status).toBe(401);
    expect(inactive.status).toBe(401);
    expect(inactive.body).toEqual(unknown.body);
  });

  it("gates normal APIs until a valid password change, then revokes on logout", async () => {
    const agent = request.agent(app);
    await agent.post("/auth/login").send({ email, password }).expect(200);

    const me = await agent.get("/auth/me").expect(200);
    expect(me.body.user.mustChangePassword).toBe(true);
    expect(JSON.stringify(me.body)).not.toContain("passwordHash");

    await agent.get("/api/categories").expect(403);
    await agent.post("/auth/change-password").send({
      currentPassword: password,
      newPassword: "ReplacementPassword123",
      confirmPassword: "ReplacementPassword123",
    }).expect(200);

    await agent.post("/auth/logout").expect(204);
    await agent.get("/auth/me").expect(401);
  });
});
