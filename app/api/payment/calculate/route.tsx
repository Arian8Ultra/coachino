import { IsAuthenticated } from "@/auth/AuthFunctions";
import { prisma } from "@/prisma/prisma";

export async function POST(request: Request) {
  const data = await request.json();
  const { amount, subscriptionId, discountCode } = data;
  const user = await IsAuthenticated();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
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

  let finalAmount = amount;

  if (discountCode && typeof discountCode === "string") {
    const codeRecord = await prisma.discountCode.findFirst({
      where: {
        code: discountCode,
        isActive: true,
        validFrom: { lte: new Date() },
        validTo: { gte: new Date() },
      },
    });

    if (codeRecord) {
      finalAmount = finalAmount * (1 - codeRecord.discountPct / 100);
    } else {
      return new Response(
        JSON.stringify({ error: "Invalid or expired discount code" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  }
  return new Response(JSON.stringify({ finalAmount }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
