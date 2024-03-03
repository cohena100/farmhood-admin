"use server";

import { z } from "zod";
import prisma from "./prismadb";
import { getTranslations } from "next-intl/server";
import { currentUser } from "@clerk/nextjs";

export async function submitForm(prevState: any, formData: FormData) {
  const t = await getTranslations("home");
  const products = await prisma.product.findMany();
  const schema = z.object(
    Object.fromEntries(
      products.map((product) => [product.id, z.coerce.number().min(0).max(3)])
    )
  );
  const parse = schema.safeParse(Object.fromEntries(formData.entries()));
  const errorState = {
    success: false,
    message: t("There was an error. Please try again later."),
  };
  if (!parse.success) {
    return errorState;
  }
  const user = await currentUser();
  if (!user) {
    return errorState;
  }
  try {
    await prisma.order.delete({ where: { authId: user.id } }).catch(() => {});
    await prisma.order.create({
      data: {
        authId: user.id,
        name: user.firstName + " " + user.lastName,
        email: user.emailAddresses[0].emailAddress,
        products: {
          create: Array.from(formData.entries())
            .filter(([_, q]) => parseInt(q.toString()))
            .map(([p, q]) => ({
              quantity: parseInt(q.toString()),
              product: {
                connect: {
                  id: p,
                },
              },
            })),
        },
      },
    });
    return {
      success: true,
      message: t("Your order was submitted successfully."),
    };
  } catch (error) {
    return errorState;
  }
}
