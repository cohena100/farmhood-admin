import { getTranslations } from "next-intl/server";
import { Label } from "flowbite-react";
import prisma from "@/lib/prismadb";
import { currentUser } from "@clerk/nextjs";
import { notFound } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from "flowbite-react";

export default async function Home() {
  const user = await currentUser();
  if (!user) notFound();
  const orders = await prisma.order.findMany();
  const g: Array<{ title: string; sum: number }> = await prisma.$queryRaw`
SELECT p.title,
       Cast(Sum(o.quantity)AS INTEGER)
FROM "Product" p
LEFT JOIN "OrderProduct" o ON p.id = o."productId"
GROUP BY p.id`;
  const t = await getTranslations("home");
  return (
    <main className="flex flex-col m-4">
      <Table>
        <TableBody className="divide-y text-start">
          <TableRow>
            <TableCell>{t("Orders")}</TableCell>
            <TableCell>{orders.length}</TableCell>
          </TableRow>
          {g.map((r) => (
            <TableRow key={r.title}>
              <TableCell>{t(r.title)}</TableCell>
              <TableCell>{r.sum ?? 0}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </main>
  );
}
