"use server";

import prisma from "./prismadb";
import { currentUser } from "@clerk/nextjs";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function closeOrder(id: string) {
  if (!(await currentUser())) {
    notFound();
  }
  await prisma.order.delete({ where: { id } }).catch(() => {});
  revalidatePath("/[locale]/orders");
  // revalidatePath("/[locale]/");
}
