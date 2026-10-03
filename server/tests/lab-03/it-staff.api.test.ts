import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { UserRole } from "@prisma/client";
import app from "../../src/app.js";
import { hashPassword } from "../../src/auth/password.js";
import { getPrisma } from "../../src/prisma.js";

function testTicketNumber() {
  const date = new Date();

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  const sequence = String(
    (Date.now() + Math.floor(Math.random() * 1000)) % 10000,
  ).padStart(4, "0");

  return `TCK-${year}${month}${day}-${sequence}`;
}

const prisma = getPrisma();

const password = "ITStaffTest123";

const requesterEmail = `it-staff-requester-${Date.now()}@example.test`;
const staffEmail = `it-staff-${Date.now()}@example.test`;
const secondStaffEmail = `it-staff-second-${Date.now()}@example.test`;

let requesterId: number;
let staffId: number;
let secondStaffId: number;
let ticketId: number;

let requesterAgent: ReturnType<typeof request.agent>;
let staffAgent: ReturnType<typeof request.agent>;

beforeAll(async () => {
  const passwordHash = await hashPassword(password);

  const requester = await prisma.user.create({
    data: {
      name: "IT Staff Test Requester",
      email: requesterEmail,
      passwordHash,
      role: UserRole.REQUESTER,
      isActive: true,
      mustChangePassword: false,
    },
  });

  const staff = await prisma.user.create({
    data: {
      name: "IT Staff Test User",
      email: staffEmail,
      passwordHash,
      role: UserRole.IT_STAFF,
      isActive: true,
      mustChangePassword: false,
    },
  });

  const secondStaff = await prisma.user.create({
  data: {
    name: "IT Staff Second Test User",
    email: secondStaffEmail,
    passwordHash,
    role: UserRole.IT_STAFF,
    isActive: true,
    mustChangePassword: false,
  },
});

  requesterId = requester.id;
  staffId = staff.id;
  secondStaffId = secondStaff.id;

  const category = await prisma.category.findFirst({
    where: { isActive: true },
    orderBy: { id: "asc" },
  });

  const relatedSystem = await prisma.relatedSystem.findFirst({
    where: { isActive: true },
    orderBy: { id: "asc" },
  });

  if (!category || !relatedSystem) {
    throw new Error("Required Lab 2 seed data is missing.");
  }

  requesterAgent = request.agent(app);
  staffAgent = request.agent(app);

  await requesterAgent
    .post("/auth/login")
    .send({
      email: requesterEmail,
      password,
    })
    .expect(200);

  await staffAgent
    .post("/auth/login")
    .send({
      email: staffEmail,
      password,
    })
    .expect(200);

  const ticket = await prisma.ticket.create({
    data: {
      ticketNumber: testTicketNumber(),
      requesterId,
      categoryId: category.id,
      relatedSystemId: relatedSystem.id,
      summary: "IT Staff queue test ticket",
      description: "Ticket created for IT Staff queue testing.",
      requestedPriority: "MEDIUM",
      currentStatus: "NEW",
    },
  });

  ticketId = ticket.id;
});

afterAll(async () => {
  await prisma.ticket.deleteMany({
    where: { id: ticketId },
  });

  await prisma.user.deleteMany({
    where: {
      id: {
        in: [requesterId, staffId, secondStaffId],
      },
    },
  });

  await prisma.$disconnect();
});

describe("Lab 3 IT Staff ticket queue", () => {
  it("rejects unauthenticated access", async () => {
    await request(app)
      .get("/api/it-staff/tickets")
      .expect(401);
  });

  it("rejects requester access", async () => {
    await requesterAgent
      .get("/api/it-staff/tickets")
      .expect(403);
  });

  it("allows IT Staff to view the ticket queue", async () => {
    const response = await staffAgent
      .get("/api/it-staff/tickets")
      .expect(200);

    expect(Array.isArray(response.body.items)).toBe(true);

    expect(
      response.body.items.some(
        (ticket: { id: number }) => ticket.id === ticketId
      )
    ).toBe(true);
  });
});

describe("Lab 3 IT Staff ticket details", () => {
  it("allows IT Staff to view ticket details", async () => {
  const response = await staffAgent
    .get(`/api/it-staff/tickets/${ticketId}`)
    .expect(200);

  expect(response.body.id).toBe(ticketId);
  expect(response.body.requester.id).toBe(requesterId);
  expect(response.body.ticketNumber).toBeTruthy();
  expect(response.body.summary).toBe("IT Staff queue test ticket");
  expect(response.body.currentStatus).toBe("NEW");
  expect(response.body.assignedStaff).toBeNull();
  expect(response.body.publicComments).toEqual([]);
  expect(response.body.internalNotes).toEqual([]);
});

  it("returns 404 for a missing ticket", async () => {
    await staffAgent
      .get("/api/it-staff/tickets/999999999")
      .expect(404);
  });
});

describe("Lab 3 IT Staff ticket claiming", () => {
  it("allows IT Staff to claim an unassigned ticket", async () => {
    const response = await staffAgent
      .post(`/api/it-staff/tickets/${ticketId}/claim`)
      .expect(200);

    expect(response.body.id).toBe(ticketId);
    expect(response.body.assignedStaff.id).toBe(staffId);
    expect(response.body.assignedStaff.role).toBe(UserRole.IT_STAFF);
  });

  it("rejects claiming an already assigned ticket", async () => {
    const response = await staffAgent
      .post(`/api/it-staff/tickets/${ticketId}/claim`)
      .expect(409);

    expect(response.body.error.code).toBe("TICKET_ALREADY_ASSIGNED");
  });
});

describe("Lab 3 IT Staff ticket reassignment", () => {
  it("allows IT Staff to reassign a ticket to another active IT Staff member", async () => {
    const response = await staffAgent
      .patch(`/api/it-staff/tickets/${ticketId}/assignment`)
      .send({
        assignedStaffId: secondStaffId,
      })
      .expect(200);

    expect(response.body.id).toBe(ticketId);
    expect(response.body.assignedStaff.id).toBe(secondStaffId);
    expect(response.body.assignedStaff.role).toBe(UserRole.IT_STAFF);
  });

  it("rejects reassignment to a non-IT Staff user", async () => {
    const response = await staffAgent
      .patch(`/api/it-staff/tickets/${ticketId}/assignment`)
      .send({
        assignedStaffId: requesterId,
      })
      .expect(400);

    expect(response.body.error.code).toBe("INVALID_ASSIGNED_STAFF");
  });

  it("rejects reassignment to an inactive IT Staff user", async () => {
    const inactiveStaff = await prisma.user.create({
      data: {
        name: "Inactive IT Staff",
        email: `it-staff-inactive-${Date.now()}@example.test`,
        passwordHash: await hashPassword(password),
        role: UserRole.IT_STAFF,
        isActive: false,
        mustChangePassword: false,
      },
    });

    try {
      const response = await staffAgent
        .patch(`/api/it-staff/tickets/${ticketId}/assignment`)
        .send({
          assignedStaffId: inactiveStaff.id,
        })
        .expect(400);

      expect(response.body.error.code).toBe("INVALID_ASSIGNED_STAFF");
    } finally {
      await prisma.user.delete({
        where: { id: inactiveStaff.id },
      });
    }
  });
});

describe("Lab 3 IT Staff priority", () => {
  it("allows IT Staff to set IT Priority", async () => {
    const response = await staffAgent
      .patch(`/api/it-staff/tickets/${ticketId}/priority`)
      .send({
        itPriority: "HIGH",
      })
      .expect(200);

    expect(response.body.id).toBe(ticketId);
    expect(response.body.itPriority).toBe("HIGH");
  });

  it("rejects an invalid IT Priority", async () => {
    const response = await staffAgent
      .patch(`/api/it-staff/tickets/${ticketId}/priority`)
      .send({
        itPriority: "URGENT",
      })
      .expect(400);

    expect(response.body.error.code).toBe("INVALID_IT_PRIORITY");
  });

  it("rejects unauthenticated IT Priority updates", async () => {
    await request(app)
      .patch(`/api/it-staff/tickets/${ticketId}/priority`)
      .send({
        itPriority: "LOW",
      })
      .expect(401);
  });

  it("rejects requester IT Priority updates", async () => {
    await requesterAgent
      .patch(`/api/it-staff/tickets/${ticketId}/priority`)
      .send({
        itPriority: "LOW",
      })
      .expect(403);
  });
});

describe("Lab 3 IT Staff public comments", () => {
  it("allows IT Staff to add a public comment", async () => {
    const response = await staffAgent
      .post(`/api/it-staff/tickets/${ticketId}/comments`)
      .send({
        body: "IT Staff public comment test.",
      })
      .expect(201);

    expect(response.body.ticketId).toBe(ticketId);
    expect(response.body.authorId).toBe(staffId);
    expect(response.body.body).toBe("IT Staff public comment test.");
    expect(response.body.author.role).toBe(UserRole.IT_STAFF);
  });

  it("rejects an empty public comment", async () => {
    const response = await staffAgent
      .post(`/api/it-staff/tickets/${ticketId}/comments`)
      .send({
        body: "   ",
      })
      .expect(400);

    expect(response.body.error.code).toBe("INVALID_COMMENT");
  });

  it("rejects unauthenticated public comments", async () => {
    await request(app)
      .post(`/api/it-staff/tickets/${ticketId}/comments`)
      .send({
        body: "Unauthenticated comment.",
      })
      .expect(401);
  });

  it("rejects requester public comments through the IT Staff API", async () => {
    await requesterAgent
      .post(`/api/it-staff/tickets/${ticketId}/comments`)
      .send({
        body: "Requester comment.",
      })
      .expect(403);
  });
});

describe("Lab 3 IT Staff internal notes", () => {
  it("allows IT Staff to add an internal note", async () => {
    const response = await staffAgent
      .post(`/api/it-staff/tickets/${ticketId}/notes`)
      .send({
        body: "IT Staff internal note test.",
      })
      .expect(201);

    expect(response.body.ticketId).toBe(ticketId);
    expect(response.body.authorId).toBe(staffId);
    expect(response.body.body).toBe("IT Staff internal note test.");
    expect(response.body.author.role).toBe(UserRole.IT_STAFF);
  });

  it("rejects an empty internal note", async () => {
    const response = await staffAgent
      .post(`/api/it-staff/tickets/${ticketId}/notes`)
      .send({
        body: "   ",
      })
      .expect(400);

    expect(response.body.error.code).toBe("INVALID_INTERNAL_NOTE");
  });

  it("rejects unauthenticated internal notes", async () => {
    await request(app)
      .post(`/api/it-staff/tickets/${ticketId}/notes`)
      .send({
        body: "Unauthenticated internal note.",
      })
      .expect(401);
  });

  it("rejects requester internal notes through the IT Staff API", async () => {
    await requesterAgent
      .post(`/api/it-staff/tickets/${ticketId}/notes`)
      .send({
        body: "Requester internal note.",
      })
      .expect(403);
  });

  it("does not expose internal notes to Requesters", async () => {
    const response = await requesterAgent
      .get(`/api/tickets/${ticketId}`)
      .expect(200);

    expect(response.body.internalNotes).toBeUndefined();
  });
});

describe("Lab 3 IT Staff status updates", () => {
  it("allows IT Staff to update ticket status", async () => {
    const response = await staffAgent
      .patch(`/api/it-staff/tickets/${ticketId}/status`)
      .send({
        currentStatus: "IN_PROGRESS",
      })
      .expect(200);

    expect(response.body.id).toBe(ticketId);
    expect(response.body.currentStatus).toBe("IN_PROGRESS");
  });

  it("allows the required Lab 3 ticket statuses", async () => {
    const statuses = [
      "NEW",
      "OPEN",
      "IN_PROGRESS",
      "WAITING_FOR_REQUESTER",
      "RESOLVED",
      "CLOSED",
      "REOPENED",
      "CANCELLED",
    ];

    for (const currentStatus of statuses) {
      const response = await staffAgent
        .patch(`/api/it-staff/tickets/${ticketId}/status`)
        .send({ currentStatus })
        .expect(200);

      expect(response.body.currentStatus).toBe(currentStatus);
    }
  });

  it("rejects an invalid ticket status", async () => {
    const response = await staffAgent
      .patch(`/api/it-staff/tickets/${ticketId}/status`)
      .send({
        currentStatus: "INVALID_STATUS",
      })
      .expect(400);

    expect(response.body.error.code).toBe("INVALID_STATUS");
  });

  it("rejects unauthenticated status updates", async () => {
    await request(app)
      .patch(`/api/it-staff/tickets/${ticketId}/status`)
      .send({
        currentStatus: "OPEN",
      })
      .expect(401);
  });

  it("rejects requester status updates", async () => {
    await requesterAgent
      .patch(`/api/it-staff/tickets/${ticketId}/status`)
      .send({
        currentStatus: "OPEN",
      })
      .expect(403);
  });
});