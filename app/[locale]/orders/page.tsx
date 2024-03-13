import { getTranslations } from "next-intl/server";
import prisma from "@/lib/prismadb";
import { currentUser } from "@clerk/nextjs";
import { notFound } from "next/navigation";
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
import { ActionButton } from "./action-button";
import OrderSelect from "./order-select";

export const metadata: Metadata = {
  title: "Orders",
};

interface OrdersPageProps {
  searchParams?: {
    id?: string;
  };
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const user = await currentUser();
  if (!user) notFound();
  const id = searchParams?.id;
  const order = await prisma.order
    .findUnique({
      where: { id },
      include: { products: { include: { product: true } }, parkingLot: true },
    })
    .catch(() => undefined);
  const orders = await prisma.order.findMany({
    include: { products: { include: { product: true } }, parkingLot: true },
    orderBy: [
      {
        name: "asc",
      },
    ],
  });
  const filteredOrders = order
    ? [order]
    : await prisma.order.findMany({
        where: { parkingLotId: id },
        include: { products: { include: { product: true } }, parkingLot: true },
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
      <OrderSelect
        defaultValue={id ?? ""}
        options={[...parkingLots, ...orders].map(({ id, name }) => ({
          id,
          name,
        }))}
      />
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
              <ActionButton
                className="self-start mb-4 mt-auto"
                label={t("Sell")}
                id={order.id}
              />
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
