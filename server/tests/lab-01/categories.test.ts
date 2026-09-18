import { afterAll, beforeAll, describe, it, expect } from "vitest";
import request from "supertest";
import { UserRole } from "@prisma/client";
import { app } from "../../src/app.js";
import { hashPassword } from "../../src/auth/password.js";
import { getPrisma } from "../../src/prisma.js";

const prisma = getPrisma();
const email = `categories-test-${Date.now()}@example.test`;
const password = "CategoriesTest123";
let agent: ReturnType<typeof request.agent>;

beforeAll(async () => {
  await prisma.user.create({
    data: {
      name: "Categories Test Requester",
      email,
      passwordHash: await hashPassword(password),
      role: UserRole.REQUESTER,
      isActive: true,
      mustChangePassword: false,
    },
  });
  agent = request.agent(app);
  await agent.post("/auth/login").send({ email, password }).expect(200);
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email } });
  await prisma.$disconnect();
});


describe("GET /api/categories", () => {
  it("returns the four seeded categories in id order", async () => {
    const response = await agent
      .get("/api/categories")
      .expect(200);

    expect(response.body).toEqual([
      { id: 1, name: "Account and Access" },
      { id: 2, name: "Hardware" },
      { id: 3, name: "Software" },
      { id: 4, name: "Network" },
    ]);
  });
});
