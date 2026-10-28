import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { UserRole } from "@prisma/client";
import app from "../../src/app.js";
import { hashPassword } from "../../src/auth/password.js";
import { getPrisma } from "../../src/prisma.js";

const prisma = getPrisma();
const password = "ActionsTakenTest123";
const suffix = Date.now();

const requesterEmail = `actions-requester-${suffix}@example.test`;
const otherRequesterEmail = `actions-other-${suffix}@example.test`;
const staffEmail = `actions-staff-${suffix}@example.test`;
const adminEmail = `actions-admin-${suffix}@example.test`;

let requesterId: number;
let otherRequesterId: number;
let staffId: number;
let adminId: number;
let requesterTicketId: number;
let otherTicketId: number;
let requesterAgent: ReturnType<typeof request.agent>;
let otherRequesterAgent: ReturnType<typeof request.agent>;
let staffAgent: ReturnType<typeof request.agent>;
let adminAgent: ReturnType<typeof request.agent>;

const createdActionIds: number[] = [];
const createdTicketIds: number[] = [];
const createdUserIds: number[] = [];

function actionUrl(ticketId: number) {
  return `/api/tickets/${ticketId}/actions-taken`;
}

async function createAction(
  agent: ReturnType<typeof request.agent>,
  ticketId: number,
  description = "Checked the network connection",
) {
  const response = await agent
    .post(actionUrl(ticketId))
    .send({
      actionDateTime: "2026-10-28T10:00:00.000Z",
      actionDescription: description,
      result: "Connection restored successfully",
      followUpRequired: false,
    })
    .expect(201);

  createdActionIds.push(response.body.id);
  return response;
}

beforeAll(async () => {
  const passwordHash = await hashPassword(password);

  const requester = await prisma.user.create({
    data: {
      name: "Actions Test Requester",
      email: requesterEmail,
      passwordHash,
      role: UserRole.REQUESTER,
      isActive: true,
      mustChangePassword: false,
    },
  });

  const otherRequester = await prisma.user.create({
    data: {
      name: "Actions Test Other Requester",
      email: otherRequesterEmail,
      passwordHash,
      role: UserRole.REQUESTER,
      isActive: true,
      mustChangePassword: false,
    },
  });

  const staff = await prisma.user.create({
    data: {
      name: "Actions Test IT Staff",
      email: staffEmail,
      passwordHash,
      role: UserRole.IT_STAFF,
      isActive: true,
      mustChangePassword: false,
    },
  });

  const admin = await prisma.user.create({
    data: {
      name: "Actions Test Administrator",
      email: adminEmail,
      passwordHash,
      role: UserRole.ADMINISTRATOR,
      isActive: true,
      mustChangePassword: false,
    },
  });

  requesterId = requester.id;
  otherRequesterId = otherRequester.id;
  staffId = staff.id;
  adminId = admin.id;
  createdUserIds.push(requester.id, otherRequester.id, staff.id, admin.id);

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

  const requesterTicket = await prisma.ticket.create({
    data: {
      requesterId,
      categoryId: category.id,
      relatedSystemId: relatedSystem.id,
      summary: "Actions Taken test ticket",
ticketNumber: `TCK-20261029-${String(9000 + (suffix % 1000)).padStart(4, "0")}`,
ticketDate: new Date("2026-10-29T00:00:00.000Z"),
      description: "Ticket created for Actions Taken API tests.",
      requestedPriority: "MEDIUM",
      currentStatus: "NEW",
    },
  });

  const otherTicket = await prisma.ticket.create({
    data: {
      requesterId: otherRequesterId,
      categoryId: category.id,
      relatedSystemId: relatedSystem.id,
      summary: "Other Actions test ticket",
ticketNumber: `TCK-20261029-${String(9000 + ((suffix + 1) % 1000)).padStart(4, "0")}`,
ticketDate: new Date("2026-10-29T00:00:00.000Z"),
      description: "Another ticket for ownership authorization tests.",
      requestedPriority: "MEDIUM",
      currentStatus: "NEW",
    },
  });

  requesterTicketId = requesterTicket.id;
  otherTicketId = otherTicket.id;
  createdTicketIds.push(requesterTicket.id, otherTicket.id);

  requesterAgent = request.agent(app);
  otherRequesterAgent = request.agent(app);
  staffAgent = request.agent(app);
  adminAgent = request.agent(app);

  for (const [agent, email] of [
    [requesterAgent, requesterEmail],
    [otherRequesterAgent, otherRequesterEmail],
    [staffAgent, staffEmail],
    [adminAgent, adminEmail],
  ] as const) {
    await agent.post("/auth/login").send({ email, password }).expect(200);
  }
});

afterAll(async () => {
  if (createdActionIds.length > 0) {
    await prisma.actionTaken.deleteMany({
      where: { id: { in: createdActionIds } },
    });
  }

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

describe("Lab 4 Actions Taken API", () => {
  it("requires authentication to read actions", async () => {
    await request(app)
      .get(actionUrl(requesterTicketId))
      .expect(401);
  });

  it("returns an empty list when a ticket has no actions", async () => {
    const response = await requesterAgent
      .get(actionUrl(requesterTicketId))
      .expect(200);

    expect(response.body).toEqual([]);
  });

  it("allows IT Staff to create an action and records the authenticated performer", async () => {
    const response = await createAction(staffAgent, requesterTicketId);

    expect(response.body.ticketId).toBe(requesterTicketId);
    expect(response.body.performedBy.id).toBe(staffId);
    expect(response.body.performedBy.name).toBe("Actions Test IT Staff");
    expect(response.body).not.toHaveProperty("performedByUserId");
  });

  it("allows an Administrator to create an action", async () => {
    const response = await createAction(adminAgent, requesterTicketId, "Administrator checked the ticket");

    expect(response.body.performedBy.id).toBe(adminId);
  });

  it("allows a requester to read actions for their own ticket", async () => {
    await createAction(staffAgent, requesterTicketId, "Requester-owned ticket action");

    const response = await requesterAgent
      .get(actionUrl(requesterTicketId))
      .expect(200);

    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body.every((action: { ticketId: number }) =>
      action.ticketId === requesterTicketId
    )).toBe(true);
  });

  it("does not let a requester read another requester's actions", async () => {
    await otherRequesterAgent
      .get(actionUrl(requesterTicketId))
      .expect(404);
  });

  it("does not let a requester create an action", async () => {
    await requesterAgent
      .post(actionUrl(requesterTicketId))
      .send({
        actionDateTime: "2026-10-28T10:00:00.000Z",
        actionDescription: "Requester tries to create an action",
        result: "Should be rejected",
        followUpRequired: false,
      })
      .expect(403);
  });

  it("rejects a client-supplied performer", async () => {
    await staffAgent
      .post(actionUrl(requesterTicketId))
      .send({
        actionDateTime: "2026-10-28T10:00:00.000Z",
        actionDescription: "Test performer protection",
        result: "Should be rejected",
        followUpRequired: false,
        performedByUserId: adminId,
      })
      .expect(400);
  });

  it("requires a follow-up note when follow-up is required", async () => {
    await staffAgent
      .post(actionUrl(requesterTicketId))
      .send({
        actionDateTime: "2026-10-28T10:00:00.000Z",
        actionDescription: "Follow-up validation test",
        result: "More work is needed",
        followUpRequired: true,
      })
      .expect(400);
  });

  it("rejects an invalid action date", async () => {
    await staffAgent
      .post(actionUrl(requesterTicketId))
      .send({
        actionDateTime: "not-a-date",
        actionDescription: "Invalid date test",
        result: "Should be rejected",
        followUpRequired: false,
      })
      .expect(400);
  });

  it("returns 404 for a missing ticket", async () => {
    await staffAgent
      .post(actionUrl(999999999))
      .send({
        actionDateTime: "2026-10-28T10:00:00.000Z",
        actionDescription: "Missing ticket test",
        result: "Should not be saved",
        followUpRequired: false,
      })
      .expect(404);
  });

  it("allows IT Staff to update an action without changing its performer", async () => {
    const created = await createAction(staffAgent, requesterTicketId);

    const response = await staffAgent
      .patch(`${actionUrl(requesterTicketId)}/${created.body.id}`)
      .send({
        result: "Updated result",
        followUpRequired: true,
        followUpNote: "Confirm the fix tomorrow",
      })
      .expect(200);

    expect(response.body.result).toBe("Updated result");
    expect(response.body.followUpRequired).toBe(true);
    expect(response.body.followUpNote).toBe("Confirm the fix tomorrow");
    expect(response.body.performedBy.id).toBe(staffId);
    expect(response.body).not.toHaveProperty("performedByUserId");
  });

  it("does not let a requester update an action", async () => {
    const created = await createAction(staffAgent, requesterTicketId);

    await requesterAgent
      .patch(`${actionUrl(requesterTicketId)}/${created.body.id}`)
      .send({ result: "Requester must not edit this" })
      .expect(403);
  });

  it("does not allow an action to be updated through another ticket's URL", async () => {
    const created = await createAction(staffAgent, requesterTicketId);

    await staffAgent
      .patch(`${actionUrl(otherTicketId)}/${created.body.id}`)
      .send({ result: "Wrong ticket URL" })
      .expect(404);
  });

  it("rejects an empty update", async () => {
    const created = await createAction(staffAgent, requesterTicketId);

    await staffAgent
      .patch(`${actionUrl(requesterTicketId)}/${created.body.id}`)
      .send({})
      .expect(400);
  });

  it("returns 404 when updating a missing action", async () => {
    await staffAgent
      .patch(`${actionUrl(requesterTicketId)}/999999999`)
      .send({ result: "Missing action" })
      .expect(404);
  });
});
