
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { CurrentStatus, UserRole } from "@prisma/client";
import app from "../../src/app.js";
import { hashPassword } from "../../src/auth/password.js";
import { getPrisma } from "../../src/prisma.js";

const prisma = getPrisma();
const password = "TicketWorkflowTest123";
const suffix = Date.now();

const requesterEmail = `workflow-requester-${suffix}@example.test`;
const staffEmail = `workflow-staff-${suffix}@example.test`;
const adminEmail = `workflow-admin-${suffix}@example.test`;

let requesterId: number;
let staffAgent: ReturnType<typeof request.agent>;
let requesterAgent: ReturnType<typeof request.agent>;
let adminAgent: ReturnType<typeof request.agent>;

const createdTicketIds: number[] = [];
const createdUserIds: number[] = [];

let categoryId: number;
let relatedSystemId: number;

function statusUrl(ticketId: number) {
  return `/api/it-staff/tickets/${ticketId}/status`;
}

function resolutionUrl(ticketId: number) {
  return `/api/it-staff/tickets/${ticketId}/resolution-summary`;
}

async function createTicket(currentStatus: CurrentStatus = CurrentStatus.NEW) {
  const ticket = await prisma.ticket.create({
    data: {
      ticketNumber: `TCK-20261031-${String(
        1000 + (createdTicketIds.length % 9000),
      ).padStart(4, "0")}-${suffix}`,
      ticketDate: new Date("2026-10-31T00:00:00.000Z"),
      requesterId,
      categoryId,
      relatedSystemId,
      summary: `Workflow test ticket ${createdTicketIds.length + 1}`,
      description: "Ticket created for Lab 4 workflow API tests.",
      requestedPriority: "MEDIUM",
      currentStatus,
    },
  });

  createdTicketIds.push(ticket.id);
  return ticket;
}

beforeAll(async () => {
  const passwordHash = await hashPassword(password);

  const requester = await prisma.user.create({
    data: {
      name: "Workflow Test Requester",
      email: requesterEmail,
      passwordHash,
      role: UserRole.REQUESTER,
      isActive: true,
      mustChangePassword: false,
    },
  });

  const staff = await prisma.user.create({
    data: {
      name: "Workflow Test IT Staff",
      email: staffEmail,
      passwordHash,
      role: UserRole.IT_STAFF,
      isActive: true,
      mustChangePassword: false,
    },
  });

  const admin = await prisma.user.create({
    data: {
      name: "Workflow Test Administrator",
      email: adminEmail,
      passwordHash,
      role: UserRole.ADMINISTRATOR,
      isActive: true,
      mustChangePassword: false,
    },
  });

  requesterId = requester.id;
  createdUserIds.push(requester.id, staff.id, admin.id);

  const category = await prisma.category.findFirst({
    where: { isActive: true },
    orderBy: { id: "asc" },
  });

  const relatedSystem = await prisma.relatedSystem.findFirst({
    where: { isActive: true },
    orderBy: { id: "asc" },
  });

  if (!category || !relatedSystem) {
    throw new Error("Required category or related-system seed data is missing.");
  }

  categoryId = category.id;
  relatedSystemId = relatedSystem.id;

  requesterAgent = request.agent(app);
  staffAgent = request.agent(app);
  adminAgent = request.agent(app);

  await requesterAgent
    .post("/auth/login")
    .send({ email: requesterEmail, password })
    .expect(200);

  await staffAgent
    .post("/auth/login")
    .send({ email: staffEmail, password })
    .expect(200);

  await adminAgent
    .post("/auth/login")
    .send({ email: adminEmail, password })
    .expect(200);
});

afterAll(async () => {
  if (createdTicketIds.length > 0) {
    await prisma.ticket.deleteMany({
      where: { id: { in: createdTicketIds } },
    });
  }

  if (createdUserIds.length > 0) {
    await prisma.user.deleteMany({
      where: { id: { in: createdUserIds } },
    });
  }
});

describe("Lab 4 Ticket Workflow API", () => {
  it("requires authentication to update ticket status", async () => {
    const ticket = await createTicket();

    await request(app)
      .patch(statusUrl(ticket.id))
      .send({ currentStatus: CurrentStatus.OPEN })
      .expect(401);
  });

  it("allows IT Staff to move a NEW ticket to OPEN", async () => {
    const ticket = await createTicket(CurrentStatus.NEW);

    const response = await staffAgent
      .patch(statusUrl(ticket.id))
      .send({ currentStatus: CurrentStatus.OPEN })
      .expect(200);

    expect(response.body.id).toBe(ticket.id);
    expect(response.body.currentStatus).toBe(CurrentStatus.OPEN);

    const savedTicket = await prisma.ticket.findUnique({
      where: { id: ticket.id },
    });

    expect(savedTicket?.currentStatus).toBe(CurrentStatus.OPEN);
  });

  it("rejects an invalid status value", async () => {
    const ticket = await createTicket();

    const response = await staffAgent
      .patch(statusUrl(ticket.id))
      .send({ currentStatus: "NOT_A_REAL_STATUS" })
      .expect(400);

    expect(response.body.error.code).toBe("INVALID_STATUS");
  });

  it("rejects an invalid status transition", async () => {
    const ticket = await createTicket(CurrentStatus.NEW);

    const response = await staffAgent
      .patch(statusUrl(ticket.id))
      .send({ currentStatus: CurrentStatus.RESOLVED })
      .expect(400);

    expect(response.body.error.code).toBe("INVALID_STATUS_TRANSITION");
  });

  it("does not allow a requester to update ticket status", async () => {
    const ticket = await createTicket();

    await requesterAgent
      .patch(statusUrl(ticket.id))
      .send({ currentStatus: CurrentStatus.OPEN })
      .expect(403);
  });

  it("does not allow an Administrator to update ticket status", async () => {
    const ticket = await createTicket();

    await adminAgent
      .patch(statusUrl(ticket.id))
      .send({ currentStatus: CurrentStatus.OPEN })
      .expect(403);
  });

  it("returns 404 when updating a missing ticket status", async () => {
    const response = await staffAgent
      .patch(statusUrl(999999999))
      .send({ currentStatus: CurrentStatus.OPEN })
      .expect(404);

    expect(response.body.error.code).toBe("TICKET_NOT_FOUND");
  });

  it("allows IT Staff to save a resolution summary", async () => {
    const ticket = await createTicket(CurrentStatus.IN_PROGRESS);

    const response = await staffAgent
      .patch(resolutionUrl(ticket.id))
      .send({ resolutionSummary: "  Network connection restored.  " })
      .expect(200);

    expect(response.body.resolutionSummary).toBe(
      "Network connection restored.",
    );

    const savedTicket = await prisma.ticket.findUnique({
      where: { id: ticket.id },
    });

    expect(savedTicket?.resolutionSummary).toBe(
      "Network connection restored.",
    );
  });

  it("allows IT Staff to clear a resolution summary", async () => {
    const ticket = await createTicket();

    await prisma.ticket.update({
      where: { id: ticket.id },
      data: { resolutionSummary: "Old summary" },
    });

    const response = await staffAgent
      .patch(resolutionUrl(ticket.id))
      .send({ resolutionSummary: "" })
      .expect(200);

    expect(response.body.resolutionSummary).toBeNull();
  });

  it("rejects a resolution summary longer than 5000 characters", async () => {
    const ticket = await createTicket();

    const response = await staffAgent
      .patch(resolutionUrl(ticket.id))
      .send({ resolutionSummary: "x".repeat(5001) })
      .expect(400);

    expect(response.body.error.code).toBe("INVALID_RESOLUTION_SUMMARY");
  });

  it("does not allow a requester to update a resolution summary", async () => {
    const ticket = await createTicket();

    await requesterAgent
      .patch(resolutionUrl(ticket.id))
      .send({ resolutionSummary: "Requester must not update this." })
      .expect(403);
  });

  it("does not allow an Administrator to update a resolution summary", async () => {
    const ticket = await createTicket();

    await adminAgent
      .patch(resolutionUrl(ticket.id))
      .send({ resolutionSummary: "Administrator must not update this." })
      .expect(403);
  });

  it("returns 404 when saving a resolution summary for a missing ticket", async () => {
    const response = await staffAgent
      .patch(resolutionUrl(999999999))
      .send({ resolutionSummary: "Missing ticket" })
      .expect(404);

    expect(response.body.error.code).toBe("TICKET_NOT_FOUND");
  });
});
