import { IsAuthenticated } from "@/auth/AuthFunctions";
import { createZibalPaymentRequest } from "@/lib/payment";
import { prisma } from "@/prisma/prisma";

export async function POST(request: Request) {
  const data = await request.json();
  const { amount, subscriptionId } = data;
  const user = await IsAuthenticated();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }
  if (!amount || typeof amount !== "number" || amount <= 0) {
    return new Response(JSON.stringify({ error: "Invalid amount provided" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId || "" },
  });
  if (subscriptionId && !subscription) {
    return new Response(JSON.stringify({ error: "Subscription not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const userTransaction = await prisma.transaction.create({
    data: {
      amount: data.amount,
      status: "PENDING",
      userId: user.id,
      subscriptionId: data.subscriptionId || null,
      transactionId: "",
    },
  });
  const response = await createZibalPaymentRequest({
    amount: amount,
    callbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/callback`,
    description: subscription
      ? `Subscription Payment for ${subscription.name}`
      : "Account Top-up",
    orderId: userTransaction.id,
    mobile: user.phone || "",
  });
  

  if (response.result !== 100) {
    return new Response(JSON.stringify({ error: response.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  const updateRes = await prisma.transaction.update({
    where: { id: userTransaction.id },
    data: { transactionId: response.trackId.toString() },
  });

  return new Response(JSON.stringify(updateRes), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
