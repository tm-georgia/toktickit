import { getPrisma } from "../src/prisma.js";

// Seed Lab 2 reference data.
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

  const developmentRequesters = [
    {
      name: "Aung Aung",
      email: "aung@example.com",
      isActive: true,
    },
    {
      name: "Su Su",
      email: "su@example.com",
      isActive: true,
    },
    {
      name: "Mg Mg",
      email: "mg@example.com",
      isActive: true,
    },
    {
      name: "Kyaw Kyaw",
      email: "kyaw@example.com",
      isActive: true,
    },
    {
      name: "Inactive User",
      email: "inactive@example.com",
      isActive: false,
    },
  ];

  for (const requester of developmentRequesters) {
    await prisma.developmentRequester.upsert({
      where: { email: requester.email },
      update: {
        name: requester.name,
        isActive: requester.isActive,
      },
      create: requester,
    });
  }

  console.log("Lab 2 reference data seeded successfully.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await getPrisma().$disconnect();
  });