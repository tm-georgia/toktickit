import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { UserRole } from "@prisma/client";
import app from "../../src/app.js";
import { hashPassword } from "../../src/auth/password.js";
import { getPrisma } from "../../src/prisma.js";

const prisma = getPrisma();

const password = "AdminTest123";
const newPassword = "NewAdminTest123!";

const adminEmail = `admin-test-${Date.now()}@example.test`;
const requesterEmail = `admin-requester-${Date.now()}@example.test`;

let adminId: number;
let requesterId: number;
let createdUserId: number;

let adminAgent: ReturnType<typeof request.agent>;
let requesterAgent: ReturnType<typeof request.agent>;

beforeAll(async () => {
  const passwordHash = await hashPassword(password);

  const admin = await prisma.user.create({
    data: {
      name: "Admin Test User",
      email: adminEmail,
      passwordHash,
      role: UserRole.ADMINISTRATOR,
      isActive: true,
      mustChangePassword: false,
    },
  });

  const requester = await prisma.user.create({
    data: {
      name: "Admin Test Requester",
      email: requesterEmail,
      passwordHash,
      role: UserRole.REQUESTER,
      isActive: true,
      mustChangePassword: false,
    },
  });

  adminId = admin.id;
  requesterId = requester.id;

  adminAgent = request.agent(app);
  requesterAgent = request.agent(app);

  await adminAgent
    .post("/auth/login")
    .send({
      email: adminEmail,
      password,
    })
    .expect(200);

  await requesterAgent
    .post("/auth/login")
    .send({
      email: requesterEmail,
      password,
    })
    .expect(200);
});

afterAll(async () => {
  await prisma.user.deleteMany({
    where: {
      id: {
        in: [adminId, requesterId, createdUserId].filter(
          (id): id is number => Number.isInteger(id)
        ),
      },
    },
  });

  await prisma.$disconnect();
});

describe("Administrator user management", () => {
  it("denies unauthenticated access to the user list", async () => {
    await request(app)
      .get("/api/admin/users")
      .expect(401);
  });

  it("denies Requester access to the user list", async () => {
    await requesterAgent
      .get("/api/admin/users")
      .expect(403);
  });

  it("allows Administrator to list users", async () => {
    const response = await adminAgent
      .get("/api/admin/users")
      .expect(200);

    expect(response.body.users).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: adminId,
          email: adminEmail,
          role: UserRole.ADMINISTRATOR,
        }),
        expect.objectContaining({
          id: requesterId,
          email: requesterEmail,
          role: UserRole.REQUESTER,
        }),
      ])
    );

    expect(response.body.users[0]).not.toHaveProperty("passwordHash");
  });

  it("allows Administrator to create a user", async () => {
    const response = await adminAgent
      .post("/api/admin/users")
      .send({
        name: "Created Admin Test User",
        email: `created-${Date.now()}@example.test`,
        role: UserRole.IT_STAFF,
        initialPassword: "CreatedUser123!",
      })
      .expect(201);

    createdUserId = response.body.user.id;

    expect(response.body.user).toMatchObject({
      name: "Created Admin Test User",
      role: UserRole.IT_STAFF,
      isActive: true,
      mustChangePassword: true,
    });

    expect(response.body.user).not.toHaveProperty("passwordHash");
  });

  it("rejects duplicate email when creating a user", async () => {
    await adminAgent
      .post("/api/admin/users")
      .send({
        name: "Duplicate Email User",
        email: adminEmail,
        role: UserRole.REQUESTER,
        initialPassword: "Duplicate123!",
      })
      .expect(409);
  });

  it("allows Administrator to edit a user", async () => {
    const response = await adminAgent
      .patch(`/api/admin/users/${requesterId}`)
      .send({
        name: "Updated Admin Test Requester",
        role: UserRole.IT_STAFF,
      })
      .expect(200);

    expect(response.body.user).toMatchObject({
      id: requesterId,
      name: "Updated Admin Test Requester",
      role: UserRole.IT_STAFF,
    });
  });

  it("rejects an invalid user role", async () => {
    await adminAgent
      .patch(`/api/admin/users/${requesterId}`)
      .send({
        role: "SUPER_ADMIN",
      })
      .expect(400);
  });

  it("allows Administrator to deactivate a user", async () => {
    const response = await adminAgent
      .patch(`/api/admin/users/${requesterId}/status`)
      .send({
        isActive: false,
      })
      .expect(200);

    expect(response.body.user).toMatchObject({
      id: requesterId,
      isActive: false,
    });
  });

  it("does not allow Administrator to deactivate their own account", async () => {
    await adminAgent
      .patch(`/api/admin/users/${adminId}/status`)
      .send({
        isActive: false,
      })
      .expect(400);
  });

  it("allows Administrator to reactivate a user", async () => {
    const response = await adminAgent
      .patch(`/api/admin/users/${requesterId}/status`)
      .send({
        isActive: true,
      })
      .expect(200);

    expect(response.body.user).toMatchObject({
      id: requesterId,
      isActive: true,
    });
  });

  it("allows Administrator to set a new initial password", async () => {
    const response = await adminAgent
      .patch(`/api/admin/users/${requesterId}/password`)
      .send({
        initialPassword: newPassword,
      })
      .expect(200);

    expect(response.body.user).toMatchObject({
      id: requesterId,
      mustChangePassword: true,
    });
  });

  it("rejects a weak initial password", async () => {
    await adminAgent
      .patch(`/api/admin/users/${requesterId}/password`)
      .send({
        initialPassword: "weak",
      })
      .expect(400);
  });

  it("denies Requester access to user creation", async () => {
    await requesterAgent
      .post("/api/admin/users")
      .send({
        name: "Blocked User",
        email: `blocked-${Date.now()}@example.test`,
        role: UserRole.REQUESTER,
        initialPassword: "BlockedUser123",
      })
      .expect(403);
  });

  it("returns 404 when editing a missing user", async () => {
    await adminAgent
      .patch("/api/admin/users/999999")
      .send({
        name: "Missing User",
      })
      .expect(404);
  });
});