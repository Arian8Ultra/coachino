import { IsAuthenticated } from "@/auth/AuthFunctions";
import { Notification_Read } from "@/prisma/functions/Notification/NotificationFun";

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
  await Notification_Read(notificationId, user.id);

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
