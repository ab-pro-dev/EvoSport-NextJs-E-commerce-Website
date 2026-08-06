import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("1. Creating test category...");
  const createdCategory = await prisma.category.create({
    data: {
      name: "Test Running Shoes",
      slug: "test-running-shoes-" + Date.now(),
    },
  });
  console.log("Created Category:", createdCategory);

  console.log("\n2. Reading created category back...");
  const fetchedCategory = await prisma.category.findUnique({
    where: { id: createdCategory.id },
  });
  console.log("Fetched Category:", fetchedCategory);

  console.log("\n3. Deleting test category...");
  const deletedCategory = await prisma.category.delete({
    where: { id: createdCategory.id },
  });
  console.log("Deleted Category:", deletedCategory);

  console.log("\n✅ Database verification completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Database verification failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
