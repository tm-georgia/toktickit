import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../../src/app.js";
import { getPrisma } from "../../src/prisma.js";
import { hashPassword } from "../../src/auth/password.js";

const prisma = getPrisma();

let requesterId: number;
let otherRequesterId: number;
let categoryId: number;
let relatedSystemId: number;
let secondCategoryId: number;
let secondRelatedSystemId: number;
let agent: ReturnType<typeof request.agent>;
let ticketId: number;
let attachmentId: number;

const testPassword = "LabFourRequester123";

const requesterPasswordHash = await hashPassword(testPassword);

const requester = await prisma.user.upsert({
  where: {
    email: "lab4.requester@test.local",
  },
  update: {
    name: "Lab 4 Requester",
    passwordHash: requesterPasswordHash,
    role: "REQUESTER",
    isActive: true,
    mustChangePassword: false,
  },
  create: {
    name: "Lab 4 Requester",
    email: "lab4.requester@test.local",
    passwordHash: requesterPasswordHash,
    role: "REQUESTER",
    isActive: true,
    mustChangePassword: false,
  },
});

beforeAll(async () => {
  const requesterPasswordHash = await hashPassword(testPassword);

  const requester = await prisma.user.upsert({
    where: {
      email: "lab4.requester@test.local",
    },
    update: {
      name: "Lab 4 Requester",
      passwordHash: requesterPasswordHash,
      role: "REQUESTER",
      isActive: true,
      mustChangePassword: false,
    },
    create: {
      name: "Lab 4 Requester",
      email: "lab4.requester@test.local",
      passwordHash: requesterPasswordHash,
      role: "REQUESTER",
      isActive: true,
      mustChangePassword: false,
    },
  });

  const otherRequester = await prisma.user.upsert({
    where: {
      email: "lab4.other.requester@test.local",
    },
    update: {
      name: "Lab 4 Other Requester",
      passwordHash: requesterPasswordHash,
      role: "REQUESTER",
      isActive: true,
      mustChangePassword: false,
    },
    create: {
      name: "Lab 4 Other Requester",
      email: "lab4.other.requester@test.local",
      passwordHash: requesterPasswordHash,
      role: "REQUESTER",
      isActive: true,
      mustChangePassword: false,
    },
  });

  const requesters = [requester, otherRequester];

  const categories = await prisma.category.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      id: "asc",
    },
    take: 2,
  });

  const relatedSystems = await prisma.relatedSystem.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      id: "asc",
    },
    take: 2,
  });

  if (requesters.length < 2) {
    throw new Error(
      "At least two active Requester seed users are required."
    );
  }

  if (categories.length < 2) {
    throw new Error(
      "At least two active categories are required."
    );
  }

  if (relatedSystems.length < 2) {
    throw new Error(
      "At least two active related systems are required."
    );
  }

  requesterId = requesters[0].id;
  otherRequesterId = requesters[1].id;
  categoryId = categories[0].id;
  secondCategoryId = categories[1].id;
  relatedSystemId = relatedSystems[0].id;
  secondRelatedSystemId = relatedSystems[1].id;

  agent = request.agent(app);

  await agent
    .post("/auth/login")
    .send({
      email: requesters[0].email,
      password: testPassword,
    })
    .expect(200);

  const ticket = await prisma.ticket.create({
    data: {
      ticketNumber: `TCK-99999999-${Date.now()}`,
      ticketDate: new Date(),
      requesterId,
      categoryId,
      relatedSystemId,
      summary: "Requester feature test ticket",
      description: "Ticket used to test requester ticket features.",
      requestedPriority: "HIGH",
      currentStatus: "NEW",
    },
  });

  ticketId = ticket.id;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("GET /api/tickets", () => {
  it("returns only the authenticated requester's tickets", async () => {
    const otherTicket = await prisma.ticket.create({
      data: {
        ticketNumber: `TCK-99999999-${Date.now()}`,
        ticketDate: new Date(),
        requesterId: otherRequesterId,
        categoryId,
        relatedSystemId,
        summary: "Other requester ticket",
        description: "This ticket belongs to another requester.",
        requestedPriority: "LOW",
        currentStatus: "NEW",
      },
    });

    const response = await agent
  .get("/api/tickets")
  .query({
    search: "Requester feature test",
    pageSize: 10,
  })
  .expect(200);

    const matchingTicket = response.body.items.find(
  (item: { id: number }) => item.id === ticketId
);

expect(matchingTicket).toBeDefined();
expect(matchingTicket.requester.id).toBe(requesterId);

    expect(
      response.body.items.some(
        (item: { id: number }) => item.id === otherTicket.id
      )
    ).toBe(false);
  });

  it("supports search by summary", async () => {
    const response = await agent
      .get("/api/tickets")
      .query({
        search: "Requester feature test",
      })
      .expect(200);

    expect(response.body.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: ticketId,
          summary: "Requester feature test ticket",
        }),
      ])
    );
  });

  it("supports category and related system filters", async () => {
    const response = await agent
      .get("/api/tickets")
      .query({
        categoryId,
        relatedSystemId,
      })
      .expect(200);

    expect(response.body.items.length).toBeGreaterThan(0);

    for (const item of response.body.items) {
      expect(item.category.id).toBe(categoryId);
      expect(item.relatedSystem.id).toBe(relatedSystemId);
      expect(item.requester.id).toBe(requesterId);
    }
  });

  it("supports priority and status filters", async () => {
    const response = await agent
      .get("/api/tickets")
      .query({
        priority: "HIGH",
        status: "NEW",
      })
      .expect(200);

    expect(response.body.items.length).toBeGreaterThan(0);

    for (const item of response.body.items) {
      expect(item.requestedPriority).toBe("HIGH");
      expect(item.currentStatus).toBe("NEW");
      expect(item.requester.id).toBe(requesterId);
    }
  });

  it("supports pagination with the allowed page sizes", async () => {
    const response = await agent
      .get("/api/tickets")
      .query({
        page: 1,
        pageSize: 10,
      })
      .expect(200);

    expect(response.body.page).toBe(1);
    expect(response.body.pageSize).toBe(10);
    expect(response.body.total).toEqual(expect.any(Number));
    expect(response.body.totalPages).toEqual(expect.any(Number));
    expect(response.body.items.length).toBeLessThanOrEqual(10);
  });

  it("rejects an invalid page size", async () => {
    const response = await agent
      .get("/api/tickets")
      .query({
        pageSize: 15,
      })
      .expect(400);

    expect(response.body.error).toBe("Invalid pageSize");
  });

  it("rejects an invalid status", async () => {
    const response = await agent
      .get("/api/tickets")
      .query({
        status: "OPEN",
      })
      .expect(400);

    expect(response.body.error).toBe("Invalid status");
  });
});

describe("GET /api/tickets/:ticketId", () => {
  it("returns the authenticated requester's own ticket", async () => {
    const response = await agent
      .get(`/api/tickets/${ticketId}`)
      .expect(200);

    expect(response.body).toMatchObject({
      id: ticketId,
      requesterId,
      summary: "Requester feature test ticket",
      requestedPriority: "HIGH",
      currentStatus: "NEW",
    });
  });

  it("does not allow viewing another requester's ticket", async () => {
    const otherTicket = await prisma.ticket.create({
      data: {
        ticketNumber: `TCK-99999999-${Date.now()}`,
        ticketDate: new Date(),
        requesterId: otherRequesterId,
        categoryId,
        relatedSystemId,
        summary: "Private other requester ticket",
        description: "This ticket must remain private.",
        requestedPriority: "LOW",
        currentStatus: "NEW",
      },
    });

    await agent
      .get(`/api/tickets/${otherTicket.id}`)
      .expect(404);
  });
});

describe("Requester attachments", () => {
  it("uploads a valid PDF attachment", async () => {
    const response = await agent
      .post(`/api/tickets/${ticketId}/attachments`)
      .attach(
        "file",
        Buffer.from("Requester attachment test"),
        {
          filename: "requester-test.pdf",
          contentType: "application/pdf",
        }
      )
      .expect(201);

    expect(response.body).toMatchObject({
      ticketId,
      originalFileName: "requester-test.pdf",
      mimeType: "application/pdf",
      sizeBytes: expect.any(Number),
    });

    expect(response.body.id).toEqual(expect.any(Number));

    attachmentId = response.body.id;
  });

  it("rejects an unsupported attachment type", async () => {
    await agent
      .post(`/api/tickets/${ticketId}/attachments`)
      .attach(
        "file",
        Buffer.from("This is not an allowed attachment."),
        {
          filename: "requester-test.txt",
          contentType: "text/plain",
        }
      )
      .expect(400);
  });
it("rejects an attachment larger than 5 MB", async () => {
  const largeFile = Buffer.alloc(5 * 1024 * 1024 + 1, "a");

  const response = await agent
    .post(`/api/tickets/${ticketId}/attachments`)
    .attach("file", largeFile, {
      filename: "too-large.pdf",
      contentType: "application/pdf",
    })
    .expect(400);

  expect(response.body.error).toBe(
    "File size must not exceed 5 MB"
  );
});

it("rejects a sixth active attachment", async () => {
  const attachmentTicket = await prisma.ticket.create({
    data: {
      ticketNumber: `TCK-99999999-${Date.now()}5`,
      ticketDate: new Date(),
      requesterId,
      categoryId,
      relatedSystemId,
      summary: "Attachment limit test ticket",
      description: "Ticket used to test the attachment limit.",
      requestedPriority: "MEDIUM",
      currentStatus: "NEW",
    },
  });

  for (let i = 1; i <= 5; i += 1) {
    await agent
      .post(`/api/tickets/${attachmentTicket.id}/attachments`)
      .attach("file", Buffer.from(`test attachment ${i}`), {
        filename: `attachment-${i}.pdf`,
        contentType: "application/pdf",
      })
      .expect(201);
  }

  const response = await agent
    .post(`/api/tickets/${attachmentTicket.id}/attachments`)
    .attach("file", Buffer.from("sixth attachment"), {
      filename: "attachment-6.pdf",
      contentType: "application/pdf",
    })
    .expect(400);

  expect(response.body.error).toBe(
    "Maximum of 5 active attachments allowed"
  );
});

  it("downloads the requester's own attachment", async () => {
    const response = await agent
      .get(
        `/api/tickets/${ticketId}/attachments/${attachmentId}`
      )
      .expect(200);

    expect(response.headers["content-disposition"]).toContain(
  "requester-test.pdf"
);
  });

  it("does not allow downloading another requester's attachment", async () => {
    const otherTicket = await prisma.ticket.create({
      data: {
        ticketNumber: `TCK-99999999-${Date.now()}`,
        ticketDate: new Date(),
        requesterId: otherRequesterId,
        categoryId,
        relatedSystemId,
        summary: "Other requester attachment ticket",
        description: "Ticket for attachment ownership testing.",
        requestedPriority: "LOW",
        currentStatus: "NEW",
      },
    });

    const otherAttachment = await prisma.attachment.create({
      data: {
        ticketId: otherTicket.id,
        originalFileName: "other-requester.pdf",
        storedFileName: "other-requester.pdf",
        mimeType: "application/pdf",
        sizeBytes: 10,
        storagePath: "uploads/other-requester.pdf",
      },
    });

    await agent
      .get(
        `/api/tickets/${otherTicket.id}/attachments/${otherAttachment.id}`
      )
      .expect(404);
  });

  it("soft-deletes the requester's own attachment", async () => {
    const response = await agent
      .delete(
        `/api/tickets/${ticketId}/attachments/${attachmentId}`
      )
      .expect(200);

    expect(response.body.id).toBe(attachmentId);
    expect(response.body.removedAt).not.toBeNull();
    expect(response.body.removalReason).toBe(
      "Removed by requester"
    );
  });
});