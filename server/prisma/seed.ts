import { getPrisma } from "../src/prisma.js";
import { UserRole } from "@prisma/client";
import { hashPassword } from "../src/auth/password.js";

// Seed Lab 2 reference data.
// Running the seed multiple times must NOT create duplicates.
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

  const users: Array<{
    name: string;
    email: string;
    role?: UserRole;
    isActive: boolean;
  }> = [
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
    {
  name: "Nandar IT",
  email: "nandar.it@example.com",
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

  for (const user of users) {
    const role = user.role ?? UserRole.REQUESTER;
    const existingUser = await prisma.user.findFirst({
      where: {
        email: {
          equals: user.email,
          mode: "insensitive",
        },
      },
      select: { id: true },
    });

    const data = {
      name: user.name,
      role,
      isActive: user.isActive,
      passwordHash,
      mustChangePassword: true,
    };

    if (existingUser) {
      await prisma.user.update({
        where: { id: existingUser.id },
        data,
      });
    } else {
      await prisma.user.create({
        data: {
          ...data,
          email: user.email.toLowerCase(),
        },
      });
    }
  }

  console.log("Lab 3 local development reference data seeded successfully.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await getPrisma().$disconnect();
  });
