import { prisma } from "@/prisma/prisma";

export async function Transaction_GetByUserId(userId: string) {
  const transactions = await prisma.transaction.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      subscription: true,
      userDiscountCode: {
        select: {
          assignedAt: true,
          discountCode: true,
          id: true,
        },
      },
      user: true,
    },
  });
  return transactions;
}
export type Transaction_GetByUserId = Awaited<
  ReturnType<typeof Transaction_GetByUserId>
>;

export async function Transaction_GetAll() {
  const transactions = await prisma.transaction.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      subscription: true,
      userDiscountCode: {
        select: {
          assignedAt: true,
          discountCode: true,
          id: true,
        },
      },
      user: true,
    },
  });
  return transactions;
}
export type Transaction_GetAll = Awaited<ReturnType<typeof Transaction_GetAll>>;

export async function Transaction_GetById(id: string) {
  const transaction = await prisma.transaction.findUnique({
    where: { id },
    include: {
      subscription: true,
      userDiscountCode: {
        select: {
          assignedAt: true,
          discountCode: true,
          id: true,
        },
      },
      user: true,
    },
  });
  return transaction;
}
export type Transaction_GetById = Awaited<
  ReturnType<typeof Transaction_GetById>
>;
