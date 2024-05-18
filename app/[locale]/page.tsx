import { getTranslations } from "next-intl/server";
import prisma from "@/lib/prismadb";
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
import { ActionButton } from "../../components/action-button";
import { Status } from "@prisma/client";

export default async function Home() {
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
      OR: [
        {
          status: Status.OPEN,
        },
        {
          status: Status.PAID,
        },
      ],
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
      <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
        {unusualOrders.map((order) => {
          const firstname = order.name.split(" ").slice(0, -1).join(" ") || " ";
          const lastname = order.name.split(" ").slice(-1).join(" ") || " ";
          return (
            <Card key={order.id}>
              <Avatar
                className="max-w-fit"
                placeholderInitials={firstname.charAt(0) + lastname.at(0)}
                size={"sm"}
                rounded
              >
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
                <TableBody className="divide-y">
                  {order.products.map((product) => (
                    <TableRow key={product.productId}>
                      <TableCell className=" text-start">
                        {t(product.product.title)}
                      </TableCell>
                      <TableCell className="flex justify-center items-center">
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
                className="self-start mb-4 mt-auto"
                label={order.status == "OPEN" ? t("Sell") : t("Deliver")}
                id={order.id}
              />
            </Card>
          );
        })}
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
