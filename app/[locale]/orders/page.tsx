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
import { Prisma } from "@prisma/client";
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
  const order = searchParams?.id
    ? await prisma.order.findUnique({
        where: { id: searchParams?.id },
        include: { products: { include: { product: true } }, parkingLot: true },
      })
    : null;
  const orders = await prisma.order.findMany({
    include: { products: { include: { product: true } }, parkingLot: true },
  });
  const filteredOrders = order ? [order] : orders;
  const t = await getTranslations("home");
  return (
    <main className="flex flex-col m-4 gap-2">
      <OrderSelect
        defaultValue={""}
        options={orders.map(({ id, firstName, lastName }) => ({
          id,
          fullname: firstName + " " + lastName,
        }))}
      />
      {filteredOrders.map((order) => (
        <Card key={order.id} className="max-w-screen-sm">
          <Avatar img={order.imageUrl ?? ""} className="max-w-fit" rounded>
            <div className="ms-2 space-y-1 font-medium dark:text-white">
              <div>{order.firstName + " " + order.lastName}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {order.emailAddresses[0]}
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
            className="self-start mb-4"
            label={t("Sell")}
            id={order.id}
          />
        </Card>
      ))}
      <Link
        href="/"
        className="font-medium text-pink-600 dark:text-pink-500 underline my-4"
      >
        {t("Back")}
      </Link>
    </main>
  );
}
