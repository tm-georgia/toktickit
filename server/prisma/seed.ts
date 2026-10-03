import {
  CurrentStatus,
  ItPriority,
  RequestedPriority,
  UserRole,
} from "@prisma/client";
import { getPrisma } from "../src/prisma.js";
import { hashPassword } from "../src/auth/password.js";

const seedTicketDate = new Date("2026-10-03T15:26:50.000Z");

function createSeedTicketNumber(sequence: number) {
  const year = seedTicketDate.getUTCFullYear();
  const month = String(seedTicketDate.getUTCMonth() + 1).padStart(2, "0");
  const day = String(seedTicketDate.getUTCDate()).padStart(2, "0");

  return `TCK-${year}${month}${day}-${String(sequence + 2).padStart(4, "0")}`;
}

async function main() {
  const prisma = getPrisma();

  const initialPassword = process.env.SEED_INITIAL_PASSWORD;

  if (!initialPassword) {
    throw new Error(
      "SEED_INITIAL_PASSWORD must be set in server/.env for local development seeds."
    );
  }

  const passwordHash = await hashPassword(initialPassword);

  const categories = [
    "Account and Access",
    "Hardware",
    "Software",
    "Network",
  ];

  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {
        isActive: true,
      },
      create: {
        name,
        isActive: true,
      },
    });
  }

  const relatedSystems = [
    "Email",
    "Campus Wi-Fi",
    "VPN",
    "LEB2 App",
    "Grade Submission App",
    "Printer",
    "Corporate Laptop",
  ];

  for (const name of relatedSystems) {
    await prisma.relatedSystem.upsert({
      where: { name },
      update: {
        isActive: true,
      },
      create: {
        name,
        isActive: true,
      },
    });
  }

  const users = [
    {
      name: "Aung Aung",
      email: "aung@example.com",
      role: UserRole.REQUESTER,
      isActive: true,
    },
    {
      name: "Su Su",
      email: "su@example.com",
      role: UserRole.REQUESTER,
      isActive: true,
    },
    {
      name: "Mg Mg",
      email: "mg@example.com",
      role: UserRole.REQUESTER,
      isActive: true,
    },
    {
      name: "Kyaw Kyaw",
      email: "kyaw@example.com",
      role: UserRole.REQUESTER,
      isActive: true,
    },
    {
      name: "Inactive Requester",
      email: "inactive@example.com",
      role: UserRole.REQUESTER,
      isActive: false,
    },
    {
      name: "Nandar IT",
      email: "nandar.it@example.com",
      role: UserRole.IT_STAFF,
      isActive: true,
    },
    {
      name: "Mya IT",
      email: "mya.it@example.com",
      role: UserRole.IT_STAFF,
      isActive: true,
    },
    {
      name: "Ko IT",
      email: "ko.it@example.com",
      role: UserRole.IT_STAFF,
      isActive: true,
    },
    {
      name: "Inactive IT",
      email: "inactive.it@example.com",
      role: UserRole.IT_STAFF,
      isActive: false,
    },
    {
      name: "Local Administrator",
      email: "admin@example.com",
      role: UserRole.ADMINISTRATOR,
      isActive: true,
    },
  ];

  const userMap = new Map<string, number>();

  for (const user of users) {
    const existingUser = await prisma.user.findFirst({
      where: {
        email: {
          equals: user.email,
          mode: "insensitive",
        },
      },
    });

    const data = {
      name: user.name,
      email: user.email.toLowerCase(),
      role: user.role,
      isActive: user.isActive,
      passwordHash,
      mustChangePassword: true,
    };

    const savedUser = existingUser
      ? await prisma.user.update({
          where: { id: existingUser.id },
          data,
        })
      : await prisma.user.create({
          data,
        });

    userMap.set(user.email, savedUser.id);
  }

  const categoryMap = new Map<string, number>();
  const systemMap = new Map<string, number>();

  const savedCategories = await prisma.category.findMany();
  for (const category of savedCategories) {
    categoryMap.set(category.name, category.id);
  }

  const savedSystems = await prisma.relatedSystem.findMany();
  for (const system of savedSystems) {
    systemMap.set(system.name, system.id);
  }

  const tickets = [
    {
      ticketNumber: createSeedTicketNumber(1),
      requesterEmail: "aung@example.com",
      category: "Account and Access",
      relatedSystem: "Email",
      summary: "Cannot access university email",
      description:
        "The requester cannot sign in to the university email account.",
      requestedPriority: RequestedPriority.HIGH,
      itPriority: ItPriority.HIGH,
      currentStatus: CurrentStatus.OPEN,
      assignedStaffEmail: "nandar.it@example.com",
    },
    {
      ticketNumber: createSeedTicketNumber(2),
      requesterEmail: "su@example.com",
      category: "Network",
      relatedSystem: "Campus Wi-Fi",
      summary: "Campus Wi-Fi disconnects frequently",
      description:
        "The requester reports repeated Wi-Fi disconnections during normal use.",
      requestedPriority: RequestedPriority.MEDIUM,
      itPriority: ItPriority.MEDIUM,
      currentStatus: CurrentStatus.IN_PROGRESS,
      assignedStaffEmail: "mya.it@example.com",
    },
    {
      ticketNumber: createSeedTicketNumber(3),
      requesterEmail: "mg@example.com",
      category: "Software",
      relatedSystem: "LEB2 App",
      summary: "LEB2 application does not open",
      description:
        "The application closes immediately after the requester launches it.",
      requestedPriority: RequestedPriority.HIGH,
      itPriority: ItPriority.HIGH,
      currentStatus: CurrentStatus.WAITING_FOR_REQUESTER,
      assignedStaffEmail: "ko.it@example.com",
    },
    {
      ticketNumber: createSeedTicketNumber(4),
      requesterEmail: "kyaw@example.com",
      category: "Hardware",
      relatedSystem: "Printer",
      summary: "Printer does not print",
      description:
        "The requester cannot print documents from the workstation.",
      requestedPriority: RequestedPriority.LOW,
      itPriority: ItPriority.LOW,
      currentStatus: CurrentStatus.RESOLVED,
      assignedStaffEmail: "nandar.it@example.com",
    },
    {
      ticketNumber: createSeedTicketNumber(5),
      requesterEmail: "aung@example.com",
      category: "Network",
      relatedSystem: "VPN",
      summary: "VPN connection fails",
      description:
        "The requester receives an error when attempting to connect to VPN.",
      requestedPriority: RequestedPriority.HIGH,
      itPriority: ItPriority.HIGH,
      currentStatus: CurrentStatus.CLOSED,
      assignedStaffEmail: "mya.it@example.com",
    },
    {
      ticketNumber: createSeedTicketNumber(6),
      requesterEmail: "su@example.com",
      category: "Software",
      relatedSystem: "Grade Submission App",
      summary: "Unable to submit grades",
      description:
        "The requester cannot complete a grade submission.",
      requestedPriority: RequestedPriority.HIGH,
      itPriority: ItPriority.HIGH,
      currentStatus: CurrentStatus.OPEN,
      assignedStaffEmail: "ko.it@example.com",
    },
    {
      ticketNumber: createSeedTicketNumber(7),
      requesterEmail: "mg@example.com",
      category: "Hardware",
      relatedSystem: "Corporate Laptop",
      summary: "Laptop battery drains quickly",
      description:
        "The laptop battery loses charge much faster than expected.",
      requestedPriority: RequestedPriority.MEDIUM,
      itPriority: ItPriority.MEDIUM,
      currentStatus: CurrentStatus.NEW,
      assignedStaffEmail: null,
    },
    {
      ticketNumber: createSeedTicketNumber(8),
      requesterEmail: "kyaw@example.com",
      category: "Account and Access",
      relatedSystem: "VPN",
      summary: "VPN account access restored",
      description:
        "The requester previously could not access VPN and is confirming access.",
      requestedPriority: RequestedPriority.LOW,
      itPriority: ItPriority.LOW,
      currentStatus: CurrentStatus.REOPENED,
      assignedStaffEmail: "nandar.it@example.com",
    },
    {
      ticketNumber: createSeedTicketNumber(9),
      requesterEmail: "aung@example.com",
      category: "Software",
      relatedSystem: "LEB2 App",
      summary: "Old application issue",
      description:
        "The requester reports that the application previously had an error.",
      requestedPriority: RequestedPriority.LOW,
      itPriority: ItPriority.LOW,
      currentStatus: CurrentStatus.CANCELLED,
      assignedStaffEmail: null,
    },
    {
      ticketNumber: createSeedTicketNumber(10),
      requesterEmail: "su@example.com",
      category: "Network",
      relatedSystem: "Campus Wi-Fi",
      summary: "New Wi-Fi connection request",
      description:
        "The requester needs assistance connecting a device to campus Wi-Fi.",
      requestedPriority: RequestedPriority.MEDIUM,
      itPriority: ItPriority.MEDIUM,
      currentStatus: CurrentStatus.NEW,
      assignedStaffEmail: null,
    },
  ];

  for (const ticket of tickets) {
    const requesterId = userMap.get(ticket.requesterEmail);
    const assignedStaffId = ticket.assignedStaffEmail
      ? userMap.get(ticket.assignedStaffEmail)
      : null;
    const categoryId = categoryMap.get(ticket.category);
    const relatedSystemId = systemMap.get(ticket.relatedSystem);

    if (
      !requesterId ||
      !categoryId ||
      !relatedSystemId ||
      (ticket.assignedStaffEmail && !assignedStaffId)
    ) {
      throw new Error(
        `Unable to resolve seed references for ${ticket.ticketNumber}.`
      );
    }

    await prisma.ticket.upsert({
      where: {
        ticketNumber: ticket.ticketNumber,
      },
      update: {
        requesterId,
        assignedStaffId,
        categoryId,
        relatedSystemId,
        summary: ticket.summary,
        description: ticket.description,
        requestedPriority: ticket.requestedPriority,
        itPriority: ticket.itPriority,
        currentStatus: ticket.currentStatus,
      },
      create: {
        ticketNumber: ticket.ticketNumber,
        ticketDate: seedTicketDate,
        requesterId,
        assignedStaffId,
        categoryId,
        relatedSystemId,
        summary: ticket.summary,
        description: ticket.description,
        requestedPriority: ticket.requestedPriority,
        itPriority: ticket.itPriority,
        currentStatus: ticket.currentStatus,
      },
    });
  }

  const publicComments = [
    {
      ticketNumber: createSeedTicketNumber(1),
      authorEmail: "nandar.it@example.com",
      body: "I am checking the account access settings and will update the ticket.",
    },
    {
      ticketNumber: createSeedTicketNumber(4),
      authorEmail: "nandar.it@example.com",
      body: "The printer configuration was corrected. Please try printing again.",
    },
    {
      ticketNumber: createSeedTicketNumber(6),
      authorEmail: "ko.it@example.com",
      body: "We are checking the grade submission service and will provide an update.",
    },
  ];

  for (const comment of publicComments) {
    const ticket = await prisma.ticket.findUnique({
      where: {
        ticketNumber: comment.ticketNumber,
      },
    });

    const authorId = userMap.get(comment.authorEmail);

    if (!ticket || !authorId) {
      throw new Error(
        `Unable to resolve public comment references for ${comment.ticketNumber}.`
      );
    }

    const existingComment = await prisma.publicComment.findFirst({
      where: {
        ticketId: ticket.id,
        authorId,
        body: comment.body,
      },
    });

    if (!existingComment) {
      await prisma.publicComment.create({
        data: {
          ticketId: ticket.id,
          authorId,
          body: comment.body,
        },
      });
    }
  }

  const internalNotes = [
    {
      ticketNumber: createSeedTicketNumber(1),
      authorEmail: "nandar.it@example.com",
      body: "Checked the account configuration. No sensitive account information is recorded in this note.",
    },
    {
      ticketNumber: createSeedTicketNumber(2),
      authorEmail: "mya.it@example.com",
      body: "Reviewed the network connection and prepared the ticket for the next troubleshooting step.",
    },
    {
      ticketNumber: createSeedTicketNumber(6),
      authorEmail: "ko.it@example.com",
      body: "Service-side troubleshooting is in progress. No credentials or confidential information are included.",
    },
  ];

  for (const note of internalNotes) {
    const ticket = await prisma.ticket.findUnique({
      where: {
        ticketNumber: note.ticketNumber,
      },
    });

    const authorId = userMap.get(note.authorEmail);

    if (!ticket || !authorId) {
      throw new Error(
        `Unable to resolve internal note references for ${note.ticketNumber}.`
      );
    }

    const existingNote = await prisma.internalNote.findFirst({
      where: {
        ticketId: ticket.id,
        authorId,
        body: note.body,
      },
    });

    if (!existingNote) {
      await prisma.internalNote.create({
        data: {
          ticketId: ticket.id,
          authorId,
          body: note.body,
        },
      });
    }
  }

  console.log(
    "Lab 3 local development seed data created/updated successfully."
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await getPrisma().$disconnect();
  });