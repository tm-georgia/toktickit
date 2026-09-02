import { getPrisma } from "../src/prisma.js";

// Seed categories and development requesters.
// Running the seed multiple times must NOT create duplicates.
async function main() {
  const prisma = getPrisma();

  const categories = [
    "Account and Access",
    "Hardware",
    "Software",
    "Network",
  ];

  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  const developmentRequesters = [
    {
      name: "Aung Aung",
      email: "aung@example.com",
    },
    {
      name: "Su Su",
      email: "su@example.com",
    },
    {
      name: "Mg Mg",
      email: "mg@example.com",
    },
  ];

  for (const requester of developmentRequesters) {
    await prisma.developmentRequester.upsert({
      where: { email: requester.email },
      update: {
        name: requester.name,
        isActive: true,
      },
      create: requester,
    });
  }

  console.log("Categories and development requesters seeded successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await getPrisma().$disconnect();
  });