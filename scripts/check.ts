import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // const groups = await prisma.orderProduct.groupBy({
  //   by: ["productId"],
  //   _sum: { quantity: true },
  // });
  // console.log(groups);
  // const groupBy = await prisma.user.groupBy({
  //   by: ['city'],
  //   _count: {
  //     city: true,
  //   },
  //   orderBy: {
  //     _count: {
  //       city: 'desc',
  //     },
  //   },select "ProductId" from "OrderProduct";
  // })
  const g = await prisma.$queryRaw`
SELECT p.title,
       Cast(Sum(o.quantity)AS INTEGER)
FROM "Product" p
INNER JOIN "OrderProduct" o ON p.id = o."productId"
GROUP BY p.id`;
  console.log(JSON.stringify(g, null, "\t"));
  // console.log(g);
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
