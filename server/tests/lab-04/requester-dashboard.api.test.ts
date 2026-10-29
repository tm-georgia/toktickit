
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { CurrentStatus, UserRole } from "@prisma/client";
import app from "../../src/app.js";
import { hashPassword } from "../../src/auth/password.js";
import { getPrisma } from "../../src/prisma.js";

const prisma = getPrisma();
const password = "DashboardTest123";
const suffix = Date.now();

const requesterEmail = `dashboard-requester-${suffix}@example.test`;
const otherRequesterEmail = `dashboard-other-${suffix}@example.test`;
const staffEmail = `dashboard-staff-${suffix}@example.test`;
const adminEmail = `dashboard-admin-${suffix}@example.test`;

let requesterId: number;
let otherRequesterId: number;
let requesterAgent: ReturnType<typeof request.agent>;
let otherRequesterAgent: ReturnType<typeof request.agent>;
let staffAgent: ReturnType<typeof request.agent>;
let adminAgent: ReturnType<typeof request.agent>;

const createdTicketIds: number[] = [];
const createdUserIds: number[] = [];

function makeTicketNumber(index: number) {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `TCK-${date}-${String((suffix % 10000 + index) % 10000).padStart(4, "0")}`;
}

async function createTicket(
  requesterId: number,
  categoryId: number,
  relatedSystemId: number,
  index: number,
  currentStatus: CurrentStatus,
  summary: string,
) {
  const ticket = await prisma.ticket.create({
    data: {
      ticketNumber: makeTicketNumber(index),
      ticketDate: new Date(),
      requesterId,
      categoryId,
      relatedSystemId,
      summary,
      description: "Requester dashboard API test ticket.",
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
      name: "Dashboard Test Requester",
      email: requesterEmail,
      passwordHash,
      role: UserRole.REQUESTER,
      isActive: true,
      mustChangePassword: false,
    },
  });

  const otherRequester = await prisma.user.create({
    data: {
      name: "Dashboard Other Requester",
      email: otherRequesterEmail,
      passwordHash,
      role: UserRole.REQUESTER,
      isActive: true,
      mustChangePassword: false,
    },
  });

  const staff = await prisma.user.create({
    data: {
      name: "Dashboard Test Staff",
      email: staffEmail,
      passwordHash,
      role: UserRole.IT_STAFF,
      isActive: true,
      mustChangePassword: false,
    },
  });

  const admin = await prisma.user.create({
    data: {
      name: "Dashboard Test Admin",
      email: adminEmail,
      passwordHash,
      role: UserRole.ADMINISTRATOR,
      isActive: true,
      mustChangePassword: false,
    },
  });

  requesterId = requester.id;
  otherRequesterId = otherRequester.id;
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

  await createTicket(
    requesterId,
    category.id,
    relatedSystem.id,
    1,
    CurrentStatus.NEW,
    "Dashboard open ticket",
  );

  await createTicket(
    requesterId,
    category.id,
    relatedSystem.id,
    2,
    CurrentStatus.WAITING_FOR_REQUESTER,
    "Dashboard attention ticket",
  );

  await createTicket(
    requesterId,
    category.id,
    relatedSystem.id,
    3,
    CurrentStatus.RESOLVED,
    "Dashboard resolved ticket",
  );

  await createTicket(
    otherRequesterId,
    category.id,
    relatedSystem.id,
    4,
    CurrentStatus.NEW,
    "Other requester private ticket",
  );

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

describe("Requester dashboard API", () => {
  it("returns dashboard metrics and ticket lists for the requester", async () => {
    const response = await requesterAgent
      .get("/api/dashboard/requester")
      .expect(200);

    expect(response.body.metrics).toEqual({
      openTickets: 2,
      waitingForRequester: 1,
      recentlyUpdated: 3,
      recentlyResolved: 1,
    });

    expect(response.body.recentTickets).toHaveLength(3);
    expect(response.body.recentlyResolvedTickets).toHaveLength(1);
    expect(response.body.attentionTickets).toHaveLength(1);

    expect(
      response.body.recentTickets.map(
        (ticket: { summary: string }) => ticket.summary,
      ),
    ).not.toContain("Other requester private ticket");
  });

  it("returns only tickets belonging to the authenticated requester", async () => {
    const response = await requesterAgent
      .get("/api/dashboard/requester")
      .expect(200);

    const summaries = [
      ...response.body.recentTickets,
      ...response.body.recentlyResolvedTickets,
      ...response.body.attentionTickets,
    ].map((ticket: { summary: string }) => ticket.summary);

    expect(summaries).not.toContain("Other requester private ticket");

    const otherResponse = await otherRequesterAgent
      .get("/api/dashboard/requester")
      .expect(200);

    expect(
      otherResponse.body.recentTickets.map(
        (ticket: { summary: string }) => ticket.summary,
      ),
    ).toContain("Other requester private ticket");
  });

  it("rejects unauthenticated requests", async () => {
    await request(app)
      .get("/api/dashboard/requester")
      .expect(401);
  });

  it("rejects IT Staff", async () => {
    await staffAgent
      .get("/api/dashboard/requester")
      .expect(403);
  });

  it("rejects Administrators", async () => {
    await adminAgent
      .get("/api/dashboard/requester")
      .expect(403);
  });
});
