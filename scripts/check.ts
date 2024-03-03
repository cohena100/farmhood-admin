import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany();
  const selection = Object.fromEntries(
    products.map((product) => [product.id, 0])
  );
  const order = await prisma.order.findUnique({
    where: { authId: "user_2cwkL0VUgBxHlJLZWOck84CgHG2" },
    include: { products: true },
  });
  if (order && order.products) {
    for (const p of order.products) {
      selection[p.productId] = p.quantity;
    }
  }
  console.log(selection);
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
