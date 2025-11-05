import { verifyZibalPayment } from "@/lib/payment";
import { prisma } from "@/prisma/prisma";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const success = url.searchParams.get("status");
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

    await prisma.transaction.update({
      where: {
        id: userTransaction.id,
      },
      data: {
        status: "VERIFIED",
        zibalStatus: status || "",
      },
    });
    return new Response("Payment successful", { status: 200 });
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
