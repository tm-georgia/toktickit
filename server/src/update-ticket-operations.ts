import { getPrisma } from "./prisma.js";

async function main() {
  const prisma = getPrisma();

  const tickets = await prisma.ticket.findMany({
    select: {
      id: true,
      requestedPriority: true,
      itPriority: true,
      currentStatus: true,
    },
  });

  for (const ticket of tickets) {
    await prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        itPriority:
          ticket.itPriority ??
          ticket.requestedPriority,

        currentStatus:
          ticket.currentStatus === "NEW"
            ? "OPEN"
            : ticket.currentStatus,
      },
    });
  }

  console.log(`Updated ${tickets.length} tickets.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });