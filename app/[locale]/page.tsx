import { getTranslations } from "next-intl/server";
import prisma from "@/lib/prismadb";
import { currentUser } from "@clerk/nextjs";
import { notFound } from "next/navigation";
import { Table, TableBody, TableCell, TableRow } from "flowbite-react";
import { Link } from "@/navigation";

export default async function Home() {
  const user = await currentUser();
  if (!user) notFound();
  const orders = await prisma.order.findMany();
  const g: Array<{ title: string; sum: number }> = await prisma.$queryRaw`
SELECT p.title,
       Cast(Sum(o.quantity)AS INTEGER)
FROM "Product" p
JOIN "OrderProduct" o ON p.id = o."productId"
GROUP BY p.id`;
  const parkingLots = await prisma.parkingLot.findMany({
    include: {
      _count: {
        select: { orders: true },
      },
    },
  });
  const t = await getTranslations("home");
  return (
    <main className="flex flex-col m-4">
      <div className="max-w-fit flex flex-col gap-2">
        <Table>
          <TableBody className="divide-y text-start">
            {g.map((r) => (
              <TableRow key={r.title}>
                <TableCell>{t(r.title)}</TableCell>
                <TableCell>{r.sum ?? 0}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Table>
          <TableBody className="divide-y text-start">
            <TableRow>
              <TableCell>{t("Total orders")}</TableCell>
              <TableCell>{orders.length}</TableCell>
            </TableRow>
            {parkingLots.map((parkingLot) => (
              <TableRow key={parkingLot.id}>
                <TableCell>{t(parkingLot.name)}</TableCell>
                <TableCell>{parkingLot._count.orders}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Link
        href="/orders"
        className="font-medium text-pink-600 dark:text-pink-500 underline my-4"
      >
        {t("Orders")}
      </Link>
    </main>
  );
}
