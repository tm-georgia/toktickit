import { describe, expect, it, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../../src/app.js";
import { getPrisma } from "../../src/prisma.js";
import { hashPassword } from "../../src/auth/password.js";

const prisma = getPrisma();

let requesterId: number;
let categoryId: number;
let relatedSystemId: number;
let agent: ReturnType<typeof request.agent>;
const testPassword = "LabTwoRequester123";

beforeAll(async () => {
  const requester = await prisma.user.findFirst({
    where: {
      isActive: true,
      role: "REQUESTER",
    },
    orderBy: {
      id: "asc",
    },
  });

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

  if (!requester || !category || !relatedSystem) {
    throw new Error(
      "Required Lab 2 seed data is missing."
    );
  }

  requesterId = requester.id;
  categoryId = category.id;
  relatedSystemId = relatedSystem.id;

  await prisma.user.update({
    where: { id: requesterId },
    data: {
      passwordHash: await hashPassword(testPassword),
      mustChangePassword: false,
    },
  });

  agent = request.agent(app);
  await agent.post("/auth/login").send({
    email: requester.email,
    password: testPassword,
  }).expect(200);
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("POST /api/tickets", () => {
  it("creates a valid ticket with backend-generated values", async () => {
    const response = await agent
      .post("/api/tickets")
      .send({
        requesterId,
        categoryId,
        relatedSystemId,
        summary: "Cannot access campus email",
        description:
          "The requester cannot access the campus email system.",
        requestedPriority: "HIGH",
      });

    expect(response.status).toBe(201);

    expect(response.body).toMatchObject({
      requester: {
        id: requesterId,
      },
      category: {
        id: categoryId,
      },
      relatedSystem: {
        id: relatedSystemId,
      },
      summary: "Cannot access campus email",
      description:
        "The requester cannot access the campus email system.",
      requestedPriority: "HIGH",
      currentStatus: "NEW",
    });

    expect(response.body.id).toEqual(expect.any(Number));

    expect(response.body.ticketNumber).toMatch(
      /^TCK-\d{8}-\d{4}$/
    );

    expect(response.body.ticketDate).toEqual(
      expect.any(String)
    );

    expect(response.body.createdAt).toEqual(
      expect.any(String)
    );

    expect(response.body.updatedAt).toEqual(
      expect.any(String)
    );
  });

  it("trims summary and description before storing", async () => {
    const response = await agent
      .post("/api/tickets")
      .send({
        requesterId,
        categoryId,
        relatedSystemId,
        summary: "   Printer is not working   ",
        description:
          "   The office printer cannot print documents.   ",
        requestedPriority: "MEDIUM",
      });

    expect(response.status).toBe(201);

    expect(response.body.summary).toBe(
      "Printer is not working"
    );

    expect(response.body.description).toBe(
      "The office printer cannot print documents."
    );
  });

  it("does not require a requester header", async () => {
    const response = await agent
      .post("/api/tickets")
      .send({
        requesterId,
        categoryId,
        relatedSystemId,
        summary: "Test ticket",
        description:
          "This is a test ticket description.",
        requestedPriority: "LOW",
      });

    expect(response.status).toBe(201);
    expect(response.body.requester.id).toBe(requesterId);
  });

  it("ignores a client requester ID", async () => {
    const differentRequester =
      await prisma.user.findFirst({
        where: {
          isActive: true,
          role: "REQUESTER",
          id: {
            not: requesterId,
          },
        },
        orderBy: {
          id: "asc",
        },
      });

    if (!differentRequester) {
      throw new Error(
        "At least two active requesters are required for this test."
      );
    }

    // A legacy client can send this header, but it cannot affect ownership.
    const response = await agent
      .post("/api/tickets")

      .send({
        requesterId: differentRequester.id,
        categoryId,
        relatedSystemId,
        summary: "Requester mismatch",
        description:
          "This request should be rejected.",
        requestedPriority: "LOW",
      });

    expect(response.status).toBe(201);
    expect(response.body.requester.id).toBe(requesterId);
  });

  it("does not let an inactive requester ID override the session", async () => {
    const inactiveRequester =
      await prisma.user.findFirst({
        where: {
          isActive: false,
          role: "REQUESTER",
        },
      });

    if (!inactiveRequester) {
      throw new Error(
        "The inactive requester seed data is missing."
      );
    }

    const response = await agent
      .post("/api/tickets")
      .send({
        requesterId: inactiveRequester.id,
        categoryId,
        relatedSystemId,
        summary: "Inactive requester",
        description:
          "This request should be rejected.",
        requestedPriority: "LOW",
      });

    expect(response.status).toBe(201);
    expect(response.body.requester.id).toBe(requesterId);
  });

  it("rejects an invalid summary", async () => {
    const response = await agent
      .post("/api/tickets")
      .send({
        requesterId,
        categoryId,
        relatedSystemId,
        summary: "Hi",
        description:
          "This description is long enough.",
        requestedPriority: "LOW",
      });

    expect(response.status).toBe(400);

    expect(response.body.error).toBe(
      "Validation failed"
    );

    expect(response.body.details).toContain(
      "Summary must be between 5 and 200 characters"
    );
  });

  it("rejects an invalid description", async () => {
    const response = await agent
      .post("/api/tickets")
      .send({
        requesterId,
        categoryId,
        relatedSystemId,
        summary: "Valid summary",
        description: "Too short",
        requestedPriority: "LOW",
      });

    expect(response.status).toBe(400);

    expect(response.body.details).toContain(
      "Description must be between 10 and 2000 characters"
    );
  });

  it("rejects an invalid priority", async () => {
    const response = await agent
      .post("/api/tickets")
      .send({
        requesterId,
        categoryId,
        relatedSystemId,
        summary: "Valid summary",
        description:
          "This description is long enough.",
        requestedPriority: "URGENT",
      });

    expect(response.status).toBe(400);

    expect(response.body.details).toContain(
      "requestedPriority must be LOW, MEDIUM, or HIGH"
    );
  });

  it("rejects a nonexistent category", async () => {
    const response = await agent
      .post("/api/tickets")
      .send({
        requesterId,
        categoryId: 999999,
        relatedSystemId,
        summary: "Valid summary",
        description:
          "This description is long enough.",
        requestedPriority: "LOW",
      });

    expect(response.status).toBe(400);

    expect(response.body.details).toContain(
      "Category does not exist or is inactive"
    );
  });

  it("rejects a nonexistent related system", async () => {
    const response = await agent
      .post("/api/tickets")
      .send({
        requesterId,
        categoryId,
        relatedSystemId: 999999,
        summary: "Valid summary",
        description:
          "This description is long enough.",
        requestedPriority: "LOW",
      });

    expect(response.status).toBe(400);

    expect(response.body.details).toContain(
      "Related System does not exist or is inactive"
    );
  });

  it("generates unique ticket numbers", async () => {
    const firstResponse = await agent
      .post("/api/tickets")
      .send({
        requesterId,
        categoryId,
        relatedSystemId,
        summary: "First unique ticket",
        description:
          "This is the first unique ticket.",
        requestedPriority: "LOW",
      });

    const secondResponse = await agent
      .post("/api/tickets")
      .send({
        requesterId,
        categoryId,
        relatedSystemId,
        summary: "Second unique ticket",
        description:
          "This is the second unique ticket.",
        requestedPriority: "LOW",
      });

    expect(firstResponse.status).toBe(201);
    expect(secondResponse.status).toBe(201);

    expect(firstResponse.body.ticketNumber).not.toBe(
      secondResponse.body.ticketNumber
    );
  });
});
