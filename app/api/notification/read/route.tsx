import { IsAuthenticated } from "@/auth/AuthFunctions";
import { prisma } from "@/prisma/prisma";

export async function GET(request: Request) {
  const user = await IsAuthenticated();
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }
  const url = new URL(request.url);
  const notificationId = url.searchParams.get("id");
  if (!notificationId) {
    return new Response(
      JSON.stringify({ error: "Notification ID is required" }),
      { status: 400 },
    );
  }

  // mark notification as read in database
  await prisma.notification.update({
    where: { id: notificationId, userId: user.id },
    data: { isRead: true },
  });
}
