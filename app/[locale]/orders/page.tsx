import { getTranslations } from "next-intl/server";
import prisma from "@/lib/prismadb";
import { Protect, currentUser } from "@clerk/nextjs";
import { notFound } from "next/navigation";
import {
  Avatar,
  Card,
  Label,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "flowbite-react";
import { Link } from "@/navigation";
import { Metadata } from "next";
import { ActionButton } from "./action-button";
import OrderSelect from "./order-select";
import { Status } from "@prisma/client";

export const metadata: Metadata = {
  title: "Orders",
};

interface OrdersPageProps {
  searchParams?: {
    id?: string;
    status?: string;
  };
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const user = await currentUser();
  if (!user) notFound();
  const id = searchParams?.id;
  const orderStatuses = searchParams?.status
    ? [{ status: Status[searchParams?.status as keyof typeof Status] }]
    : [
        {
          status: Status.OPEN,
        },
        {
          status: Status.PAID,
        },
      ];
  const userOrders = await prisma.order
    .findMany({
      where: {
        userId: id,
        OR: orderStatuses,
      },
      include: { products: { include: { product: true } }, parkingLot: true },
    })
    .catch(() => []);
  const orders = await prisma.order.findMany({
    where: {
      OR: orderStatuses,
    },
    distinct: ["userId"],
    include: { products: { include: { product: true } }, parkingLot: true },
    orderBy: [
      {
        name: "asc",
      },
    ],
  });
  const filteredOrders =
    userOrders.length > 0
      ? userOrders
      : await prisma.order.findMany({
          where: {
            parkingLotId: id,
            OR: orderStatuses,
          },
          include: {
            products: { include: { product: true } },
            parkingLot: true,
          },
          orderBy: [
            {
              name: "asc",
            },
          ],
        });
  const t = await getTranslations("home");
  const parkingLots = (await prisma.parkingLot.findMany()).map(
    ({ id, name }) => ({ id, name: t(name) })
  );
  return (
    <main className="flex flex-col m-4 gap-2">
      <div className="flex gap-10">
        <OrderSelect
          defaultValue={id ?? "1"}
          options={[
            {
              id: "1",
              name: t("Orders"),
            },
            ...parkingLots.map(({ id, name }) => ({
              id,
              name,
            })),
            ...orders.map(({ userId, name }) => ({
              id: userId,
              name,
            })),
          ]}
          searchParam="id"
        />
        <OrderSelect
          defaultValue={searchParams?.status ?? "1"}
          options={[
            {
              id: "1",
              name: t("Status"),
            },
            {
              id: Status.OPEN,
              name: t("Ordered"),
            },
            {
              id: Status.PAID,
              name: t("Paid"),
            },
          ]}
          searchParam="status"
        />
      </div>
      <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-3">
        {filteredOrders.map((order) => (
          <Card key={order.id}>
            <div className="flex flex-col h-full">
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
                      <TableCell>{product.quantity}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Protect
                role="org:admin"
                fallback={
                  <Label color="failure" className="self-start mb-4 mt-auto">
                    {t("You are not authorized to perform actions on orders.")}
                  </Label>
                }
              >
                <ActionButton
                  className="self-start mb-4 mt-auto"
                  label={order.status == "OPEN" ? t("Sell") : t("Deliver")}
                  id={order.id}
                />
              </Protect>
            </div>
          </Card>
        ))}
      </div>
      <Link
        href="/"
        className="font-medium text-pink-600 dark:text-pink-500 underline my-4"
      >
        {t("Back")}
      </Link>
    </main>
  );
}
