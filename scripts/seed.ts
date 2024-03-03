import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.product.createMany({
    data: [
      { title: "baby cucubers" },
      { title: "strawberries" },
      { title: "cherry tomato" },
      { title: "foreign-made blueberries" },
      { title: "israeli blueberries" },
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
