import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.company.count();
  if (existing > 0) return;

  await prisma.company.createMany({
    data: [
      { name: "Entreprise 1", color: "#6366f1" },
      { name: "Entreprise 2", color: "#10b981" },
      { name: "Entreprise 3", color: "#f59e0b" },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
