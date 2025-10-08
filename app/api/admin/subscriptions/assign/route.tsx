import { prisma } from "@/prisma/prisma";

export async function POST(request: Request) {
  // get the ids of users and the id of the subscription from the body
  const body = await request.json();
  const { userIds, subscriptionId } = body;
  if (!userIds || !subscriptionId) {
    return new Response(
      JSON.stringify({
        error: "Missing required fields: userIds, subscriptionId",
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
  });
  if (!subscription) {
    return new Response(JSON.stringify({ error: "Subscription not found" }), {
      status: 404,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  try {
    // for each user create a subscription
    await Promise.all(
      userIds.map(async (userId: string) => {
        await prisma.userSubscription.deleteMany({
          where: { userId },
        });
        await prisma.userSubscription.create({
          data: {
            userId,
            subscriptionId,
            startDate: new Date(),
            endDate: new Date(
              new Date().setMonth(
                new Date().getMonth() + subscription.duration,
              ),
            ),
          },
        });
      }),
    );
    return new Response(JSON.stringify({ message: "Subscriptions assigned" }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Error assigning subscriptions",
        details: error,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
}
