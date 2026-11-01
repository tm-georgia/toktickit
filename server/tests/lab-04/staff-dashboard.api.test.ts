
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { CurrentStatus, UserRole } from "@prisma/client";
import app from "../../src/app.js";
import { hashPassword } from "../../src/auth/password.js";
import { getPrisma } from "../../src/prisma.js";

const prisma = getPrisma();
const password = "StaffDashboardTest123";
const suffix = Date.now();
const marker = `StaffDashboard${suffix}`;

const requesterEmail = `dashboard-requester-${suffix}@example.test`;
const otherRequesterEmail = `dashboard-other-${suffix}@example.test`;
const staffEmail = `dashboard-staff-${suffix}@example.test`;
const adminEmail = `dashboard-admin-${suffix}@example.test`;

let requesterId: number;
let staffId: number;

let requesterAgent: ReturnType<typeof request.agent>;
let otherRequesterAgent: ReturnType<typeof request.agent>;
let staffAgent: ReturnType<typeof request.agent>;
let adminAgent: ReturnType<typeof request.agent>;

let categoryId: number;
let relatedSystemId: number;

const createdTicketIds: number[] = [];
const createdUserIds: number[] = [];

async function createTicket(
  summary: string,
  currentStatus: CurrentStatus,
  assignedStaffId: number | null = null,
) {
  const ticket = await prisma.ticket.create({
    data: {
      ticketNumber: `TCK-20261031-${String(
        1000 + (createdTicketIds.length % 9000),
      ).padStart(4, "0")}-${suffix}`,
      ticketDate: new Date("2026-10-31T00:00:00.000Z"),
      requesterId,
      categoryId,
      relatedSystemId,
      summary,
      description: "Ticket created for Lab 4 staff dashboard API tests.",
      requestedPriority: "MEDIUM",
      currentStatus,
      assignedStaffId,
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
      name: "Dashboard Test Other Requester",
      email: otherRequesterEmail,
      passwordHash,
      role: UserRole.REQUESTER,
      isActive: true,
      mustChangePassword: false,
    },
  });

  const staff = await prisma.user.create({
    data: {
      name: "Dashboard Test IT Staff",
      email: staffEmail,
      passwordHash,
      role: UserRole.IT_STAFF,
      isActive: true,
      mustChangePassword: false,
    },
  });

  const admin = await prisma.user.create({
    data: {
      name: "Dashboard Test Administrator",
      email: adminEmail,
      passwordHash,
      role: UserRole.ADMINISTRATOR,
      isActive: true,
      mustChangePassword: false,
    },
  });

  requesterId = requester.id;
  staffId = staff.id;

  createdUserIds.push(
    requester.id,
    otherRequester.id,
    staff.id,
    admin.id,
  );

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

  await createTicket(
    `${marker} unassigned NEW ticket`,
    CurrentStatus.NEW,
  );

  await createTicket(
    `${marker} assigned IN_PROGRESS ticket`,
    CurrentStatus.IN_PROGRESS,
    staffId,
  );

  await createTicket(
    `${marker} assigned RESOLVED ticket`,
    CurrentStatus.RESOLVED,
    staffId,
  );

  requesterAgent = request.agent(app);
  otherRequesterAgent = request.agent(app);
  staffAgent = request.agent(app);
  adminAgent = request.agent(app);

  await requesterAgent
    .post("/auth/login")
    .send({ email: requesterEmail, password })
    .expect(200);

  await otherRequesterAgent
    .post("/auth/login")
    .send({ email: otherRequesterEmail, password })
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

describe("Lab 4 Staff Dashboard API", () => {
  it("requires authentication to access the staff ticket queue", async () => {
    await request(app)
      .get("/api/it-staff/tickets")
      .expect(401);
  });

  it("allows IT Staff to load the ticket queue", async () => {
  const response = await staffAgent
    .get("/api/it-staff/tickets")
    .query({ search: marker })
    .expect(200);

    expect(response.body).toHaveProperty("items");
    expect(response.body).toHaveProperty("tickets");
    expect(response.body).toHaveProperty("total");
    expect(response.body).toHaveProperty("page");
    expect(response.body).toHaveProperty("pageSize");
    expect(response.body).toHaveProperty("totalPages");

    expect(response.body.items).toEqual(response.body.tickets);
    expect(
      response.body.tickets.some(
        (ticket: { summary: string }) =>
          ticket.summary.includes(marker),
      ),
    ).toBe(true);
  });

  it("allows Administrators to view the staff ticket queue", async () => {
    await adminAgent
      .get("/api/it-staff/tickets")
      .expect(200);
  });

  it("does not allow Requesters to access the staff ticket queue", async () => {
    await requesterAgent
      .get("/api/it-staff/tickets")
      .expect(403);
  });

  it("filters tickets by status", async () => {
    const response = await staffAgent
      .get("/api/it-staff/tickets")
      .query({
        search: marker,
        status: CurrentStatus.IN_PROGRESS,
      })
      .expect(200);

    expect(response.body.tickets.length).toBeGreaterThan(0);

    expect(
      response.body.tickets.every(
        (ticket: { currentStatus: string }) =>
          ticket.currentStatus === CurrentStatus.IN_PROGRESS,
      ),
    ).toBe(true);
  });

  it("filters unassigned tickets", async () => {
    const response = await staffAgent
      .get("/api/it-staff/tickets")
      .query({
        search: marker,
        assignedTo: "unassigned",
      })
      .expect(200);

    expect(response.body.tickets.length).toBeGreaterThan(0);

    expect(
      response.body.tickets.every(
        (ticket: { assignedStaffId: number | null }) =>
          ticket.assignedStaffId === null,
      ),
    ).toBe(true);
  });

  it("filters tickets assigned to the authenticated staff member", async () => {
    const response = await staffAgent
      .get("/api/it-staff/tickets")
      .query({
        search: marker,
        assignedTo: "me",
      })
      .expect(200);

    expect(response.body.tickets.length).toBeGreaterThan(0);

    expect(
      response.body.tickets.every(
        (ticket: { assignedStaffId: number | null }) =>
          ticket.assignedStaffId === staffId,
      ),
    ).toBe(true);
  });

  it("supports pagination", async () => {
    const response = await staffAgent
      .get("/api/it-staff/tickets")
      .query({
        search: marker,
        page: 1,
        pageSize: 2,
      })
      .expect(200);

    expect(response.body.page).toBe(1);
    expect(response.body.pageSize).toBe(2);
    expect(response.body.tickets.length).toBeLessThanOrEqual(2);
    expect(response.body.total).toBe(3);
  });

  it("supports searching by ticket summary", async () => {
    const response = await staffAgent
      .get("/api/it-staff/tickets")
      .query({ search: `${marker} unassigned` })
      .expect(200);

    expect(response.body.tickets.length).toBe(1);
    expect(response.body.tickets[0].summary).toContain("unassigned");
  });

  it("supports sorting by ticket number", async () => {
    const response = await staffAgent
      .get("/api/it-staff/tickets")
      .query({
        search: marker,
        sort: "ticketNumber",
      })
      .expect(200);

    const numbers = response.body.tickets.map(
      (ticket: { ticketNumber: string }) => ticket.ticketNumber,
    );

    expect(numbers).toEqual([...numbers].sort());
  });

  it("returns requester and related ticket information", async () => {
    const response = await staffAgent
      .get("/api/it-staff/tickets")
      .query({ search: marker })
      .expect(200);

    const ticket = response.body.tickets[0];

    expect(ticket.requester).toHaveProperty("id");
    expect(ticket.requester).toHaveProperty("name");
    expect(ticket.requester).toHaveProperty("email");
    expect(ticket).toHaveProperty("category");
    expect(ticket).toHaveProperty("relatedSystem");
    expect(ticket).toHaveProperty("assignedStaff");
    expect(ticket).toHaveProperty("attachments");
  });
});
