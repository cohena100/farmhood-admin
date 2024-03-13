import { getTranslations } from "next-intl/server";
import prisma from "@/lib/prismadb";
import { currentUser } from "@clerk/nextjs";
import { notFound } from "next/navigation";
import {
  Avatar,
  Badge,
  Card,
  Label,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "flowbite-react";
import { Link } from "@/navigation";
import { ActionButton } from "./orders/action-button";

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
  const unusualOrders = await prisma.order.findMany({
    where: {
      products: {
        some: {
          quantity: {
            gt: 4,
          },
        },
      },
    },
    include: { products: { include: { product: true } }, parkingLot: true },
    orderBy: [
      {
        name: "asc",
      },
    ],
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
      {unusualOrders.length > 0 && (
        <Label
          value={t("Unusual orders") + ":"}
          className="my-4 font-bold text-lg  text-pink-600 dark:text-pink-500 "
        />
      )}
      {unusualOrders.map((order) => (
        <Card key={order.id} className="max-w-fit">
          <Avatar img={order.imageUrl ?? ""} className="max-w-fit" rounded>
            <div className="ms-2 space-y-1 font-medium dark:text-white">
              <div>{order.name}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {order.phone}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {t(order.parkingLot.name)}
              </div>
            </div>
          </Avatar>
          <Table>
            <TableBody className="divide-y text-start">
              {order.products.map((product) => (
                <TableRow key={product.productId}>
                  <TableCell>{t(product.product.title)}</TableCell>
                  <TableCell className="text-center">
                    {product.quantity > 4 ? (
                      <Badge color="pink">{product.quantity}</Badge>
                    ) : (
                      product.quantity
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <ActionButton
            className="self-start mb-4"
            label={t("Sell")}
            id={order.id}
          />
        </Card>
      ))}
      <Link
        href="/orders"
        className="font-medium text-pink-600 dark:text-pink-500 underline my-4"
      >
        {t("Orders")}
      </Link>
    </main>
  );
}
