import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { UserRole } from "@prisma/client";
import app from "../../src/app.js";
import { hashPassword } from "../../src/auth/password.js";
import { getPrisma } from "../../src/prisma.js";
import fs from "node:fs/promises";

const prisma = getPrisma();

const password = "AuthorizationTest123";

const requesterAEmail = `authorization-a-${Date.now()}@example.test`;
const requesterBEmail = `authorization-b-${Date.now()}@example.test`;
const inactiveEmail = `authorization-inactive-${Date.now()}@example.test`;

let requesterAId: number;
let requesterBId: number;
let inactiveUserId: number;

let categoryId: number;
let relatedSystemId: number;

let requesterAAgent: ReturnType<typeof request.agent>;
let requesterBAgent: ReturnType<typeof request.agent>;

let requesterATicketId: number;
let requesterBTicketId: number;
let attachmentId: number;
let attachmentStoragePath: string;
let inactiveSessionAgent: ReturnType<typeof request.agent>;

beforeAll(async () => {
  const passwordHash = await hashPassword(password);

  const requesterA = await prisma.user.create({
    data: {
      name: "Authorization Requester A",
      email: requesterAEmail,
      passwordHash,
      role: UserRole.REQUESTER,
      isActive: true,
      mustChangePassword: false,
    },
  });

  const requesterB = await prisma.user.create({
    data: {
      name: "Authorization Requester B",
      email: requesterBEmail,
      passwordHash,
      role: UserRole.REQUESTER,
      isActive: true,
      mustChangePassword: false,
    },
  });

  const inactiveUser = await prisma.user.create({
    data: {
      name: "Authorization Inactive User",
      email: inactiveEmail,
      passwordHash,
      role: UserRole.REQUESTER,
      isActive: false,
      mustChangePassword: false,
    },
  });

  requesterAId = requesterA.id;
  requesterBId = requesterB.id;
  inactiveUserId = inactiveUser.id;

  const category = await prisma.category.findFirst({
    where: {
      isActive: true,
    },
    orderBy: {
      id: "asc",
    },
  });

  const relatedSystem = await prisma.relatedSystem.findFirst({
    where: {
      isActive: true,
    },
    orderBy: {
      id: "asc",
    },
  });

  if (!category || !relatedSystem) {
    throw new Error("Required Lab 2 seed data is missing.");
  }

  categoryId = category.id;
  relatedSystemId = relatedSystem.id;

  requesterAAgent = request.agent(app);
  requesterBAgent = request.agent(app);

  await requesterAAgent
    .post("/auth/login")
    .send({
      email: requesterAEmail,
      password,
    })
    .expect(200);

  await requesterBAgent
    .post("/auth/login")
    .send({
      email: requesterBEmail,
      password,
    })
    .expect(200);

  const ticketAResponse = await requesterAAgent
    .post("/api/tickets")
    .send({
      requesterId: requesterBId,
      categoryId,
      relatedSystemId,
      summary: "Requester A private ticket",
      description:
        "This ticket belongs only to requester A.",
      requestedPriority: "HIGH",
    })
    .expect(201);

  const ticketBResponse = await requesterBAgent
    .post("/api/tickets")
    .send({
      requesterId: requesterAId,
      categoryId,
      relatedSystemId,
      summary: "Requester B private ticket",
      description:
        "This ticket belongs only to requester B.",
      requestedPriority: "LOW",
    })
    .expect(201);

  requesterATicketId = ticketAResponse.body.id;
  requesterBTicketId = ticketBResponse.body.id;
});

afterAll(async () => {
    if (attachmentStoragePath) {
    await fs.rm(attachmentStoragePath, { force: true });
  }

  await prisma.ticket.deleteMany({
    where: {
      id: {
        in: [requesterATicketId, requesterBTicketId],
      },
    },
  });

  await prisma.user.deleteMany({
    where: {
      id: {
        in: [requesterAId, requesterBId, inactiveUserId],
      },
    },
  });

  await prisma.$disconnect();
});

describe("Lab 3 requester authorization", () => {
  it("rejects unauthenticated access to protected APIs", async () => {
    await request(app)
      .get("/api/tickets")
      .expect(401);
  });

  it("returns only the authenticated requester's tickets", async () => {
    const response = await requesterAAgent
      .get("/api/tickets")
      .expect(200);

    expect(
      response.body.items.every(
        (ticket: { requester: { id: number } }) =>
          ticket.requester.id === requesterAId
      )
    ).toBe(true);

    expect(
      response.body.items.some(
        (ticket: { id: number }) =>
          ticket.id === requesterBTicketId
      )
    ).toBe(false);
  });

  it("does not allow a requester ID query parameter to change ownership", async () => {
    const response = await requesterAAgent
      .get(`/api/tickets?requesterId=${requesterBId}`)
      .expect(200);

    expect(
      response.body.items.every(
        (ticket: { requester: { id: number } }) =>
          ticket.requester.id === requesterAId
      )
    ).toBe(true);

    expect(
      response.body.items.some(
        (ticket: { id: number }) =>
          ticket.id === requesterBTicketId
      )
    ).toBe(false);
  });

  it("allows a requester to view their own ticket", async () => {
    const response = await requesterAAgent
      .get(`/api/tickets/${requesterATicketId}`)
      .expect(200);

    expect(response.body.id).toBe(requesterATicketId);
    expect(response.body.requester.id).toBe(requesterAId);
  });

  it("denies access to another requester's ticket", async () => {
    await requesterAAgent
      .get(`/api/tickets/${requesterBTicketId}`)
      .expect(404);
  });

    it("denies another requester from downloading or deleting an attachment", async () => {
    const uploadResponse = await requesterAAgent
      .post(`/api/tickets/${requesterATicketId}/attachments`)
      .attach("file", Buffer.from("private attachment test"), {
        filename: "private-test.pdf",
        contentType: "application/pdf",
      })
      .expect(201);

    attachmentId = uploadResponse.body.id;
    attachmentStoragePath = uploadResponse.body.storagePath;

    expect(attachmentId).toBeGreaterThan(0);

    await requesterBAgent
      .get(
        `/api/tickets/${requesterATicketId}/attachments/${attachmentId}`
      )
      .expect(404);

    await requesterBAgent
      .delete(
        `/api/tickets/${requesterATicketId}/attachments/${attachmentId}`
      )
      .expect(404);

    await requesterAAgent
      .get(
        `/api/tickets/${requesterATicketId}/attachments/${attachmentId}`
      )
      .expect(200);
  });

  it("allows a requester to create a ticket owned by their session", async () => {
    const response = await requesterAAgent
      .post("/api/tickets")
      .send({
        requesterId: requesterBId,
        categoryId,
        relatedSystemId,
        summary: "Session ownership test",
        description:
          "The session must determine ticket ownership.",
        requestedPriority: "MEDIUM",
      })
      .expect(201);

    expect(response.body.requester.id).toBe(requesterAId);

    await prisma.ticket.delete({
      where: {
        id: response.body.id,
      },
    });
  });

  it("does not allow an inactive user to use a protected API", async () => {
    const inactiveAgent = request.agent(app);

    await inactiveAgent
      .post("/auth/login")
      .send({
        email: inactiveEmail,
        password,
      })
      .expect(401);

    expect(inactiveUserId).toBeGreaterThan(0);

    await inactiveAgent
      .get("/api/tickets")
      .expect(401);
  });
});
    it("does not allow an inactive user to use a protected API", async () => {
    const inactiveAgent = request.agent(app);

    await inactiveAgent
      .post("/auth/login")
      .send({ email: inactiveEmail, password })
      .expect(401);

    expect(inactiveUserId).toBeGreaterThan(0);

    await inactiveAgent.get("/api/tickets").expect(401);
  });