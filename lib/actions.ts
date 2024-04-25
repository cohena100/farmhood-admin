"use server";

import prisma from "./prismadb";
import { revalidatePath } from "next/cache";

export async function closeOrder(id: string) {
  await prisma.order
    .update({
      where: { id },
      data: {
        status: "DONE",
      },
    })
    .catch(() => {});
  revalidatePath("/[locale]/orders", "page");
}
