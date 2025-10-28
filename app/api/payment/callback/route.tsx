import { IsAuthenticated } from "@/auth/AuthFunctions";
import { prisma } from "@/prisma/prisma";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const success = url.searchParams.get("status");
  const trackId = url.searchParams.get("trackId");
  const orderId = url.searchParams.get("orderId");
  const status = url.searchParams.get("status");

  const user = IsAuthenticated();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

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
    await prisma.transaction.update({
      where: {
        id: userTransaction.id,
      },
      data: {
        status: "SUCCESS",
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
