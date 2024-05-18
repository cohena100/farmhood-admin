import { getTranslations } from "next-intl/server";
import prisma from "@/lib/prismadb";
import {
  Avatar,
  Card,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "flowbite-react";
import { Link } from "@/navigation";
import { Metadata } from "next";
import { ActionButton } from "../../../components/action-button";
import OrderSelect from "../../../components/order-select";
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
  const orders = await prisma.order.findMany({
    where: {
      userId: { not: null },
    },
    distinct: ["userId"],
    include: { products: { include: { product: true } }, parkingLot: true },
    orderBy: [
      {
        name: "asc",
      },
    ],
  });
  const searchParamsStatus = (searchParams?.status && [
    { status: Status[searchParams.status as keyof typeof Status] },
  ]) || [
    {
      status: Status.OPEN,
    },
    {
      status: Status.PAID,
    },
  ];
  const filteredOrders = await prisma.order
    .findMany({
      where: {
        AND: {
          OR: [
            { userId: searchParams?.id },
            { parkingLotId: searchParams?.id },
          ],
        },
        OR: searchParamsStatus,
        products: {
          some: {},
        },
      },
      include: { products: { include: { product: true } }, parkingLot: true },
      orderBy: [
        {
          name: "asc",
        },
      ],
    })
    .catch(() => []);
  const t = await getTranslations("home");
  const parkingLots = (await prisma.parkingLot.findMany()).map(
    ({ id, name }) => ({ id, name: t(name) })
  );
  return (
    <main className="flex flex-col m-4 gap-2">
      <div className="flex gap-10">
        <OrderSelect
          defaultValue={searchParams?.id ?? "1"}
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
              id: userId!,
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
        {filteredOrders.map((order) => {
          const firstname = order.name.split(" ").slice(0, -1).join(" ") || " ";
          const lastname = order.name.split(" ").slice(-1).join(" ") || " ";
          return (
            <Card key={order.id}>
              <div className="flex flex-col h-full">
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
                  <TableBody className="divide-y text-start">
                    {order.products.map((product) => (
                      <TableRow key={product.productId}>
                        <TableCell>{t(product.product.title)}</TableCell>
                        <TableCell>{product.quantity}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <ActionButton
                  className="self-start mb-4 mt-auto"
                  label={order.status == "OPEN" ? t("Sell") : t("Deliver")}
                  id={order.id}
                />
              </div>
            </Card>
          );
        })}
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
