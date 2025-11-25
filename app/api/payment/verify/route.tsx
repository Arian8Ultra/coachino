import { IsAuthenticated } from "@/auth/AuthFunctions";
import { verifyZibalPayment } from "@/lib/payment";
import { prisma } from "@/prisma/prisma";

export async function POST(request: Request) {
  const data = await request.json();
  const { transactionId } = data;
  const user = await IsAuthenticated();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const transaction = await prisma.transaction.findFirst({
    where: { id: transactionId, userId: user.id },
  });
  if (!transaction) {
    return new Response(JSON.stringify({ error: "Transaction not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const response = await verifyZibalPayment({
    trackId: Number(transaction.transactionId),
  });
  if (response.result !== 100) {
    return new Response(JSON.stringify({ error: response.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  await prisma.transaction.update({
    where: { id: transactionId },
    data: { status: "VERIFIED" },
  });

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
