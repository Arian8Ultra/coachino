import { verifyZibalPayment } from "@/lib/payment";
import { prisma } from "@/prisma/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const success = url.searchParams.get("success");
  const trackId = url.searchParams.get("trackId");
  const orderId = url.searchParams.get("orderId");
  const status = url.searchParams.get("status");

  const userTransaction = await prisma.transaction.findFirst({
    where: {
      id: orderId || "",
      transactionId: trackId || "",
    },
  });
  if (!userTransaction) {
    return new Response("Transaction not found", { status: 404 });
  }
  if (success === "1") {
    console.log("verifyZibalPayment");

    const verifyResponse = await verifyZibalPayment({
      trackId: Number(userTransaction.transactionId),
    });

    if (verifyResponse.result !== 100) {
      await prisma.transaction.update({
        where: { id: userTransaction.id },
        data: { status: "FAILED", zibalStatus: status || "" },
      });
      return new Response("Payment failed", { status: 400 });
    }

    if (userTransaction.subscriptionId) {
      const subscription = await prisma.subscription.findUnique({
        where: { id: userTransaction.subscriptionId },
      });

      if (subscription) {
        const startDate = new Date();
        const endDate = new Date(
          new Date().setMonth(new Date().getMonth() + subscription.duration),
        );
        await prisma.userSubscription.updateMany({
          where: { userId: userTransaction.userId },
          data: {
            isActive: false,
          },
        });
        // then create a new one
        await prisma.userSubscription.create({
          data: {
            userId: userTransaction.userId,
            subscriptionId: subscription.id,
            startDate,
            endDate,
          },
        });
      }
    }

    await prisma.transaction.update({
      where: {
        id: userTransaction.id,
      },
      data: {
        status: "VERIFIED",
        zibalStatus: status || "",
      },
    });

    await prisma.userDiscountCode.create({
      data: {
        userId: userTransaction.userId,
        discountCodeId: userTransaction.userDiscountCodeId || "",
        assignedAt: new Date(),
      },
    });

    return NextResponse.redirect(new URL("/panel/profile", request.url));
  } else {
    await prisma.transaction.update({
      where: {
        id: userTransaction.id,
      },
      data: {
        status: "FAILED",
        zibalStatus: status || "",
      },
    });
    return new Response("Payment failed", { status: 400 });
  }
}
