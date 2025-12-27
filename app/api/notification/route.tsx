import { IsAuthenticated } from "@/auth/AuthFunctions";
import {
  Notification_Create,
  Notification_Delete,
} from "@/prisma/functions/Notification/NotificationFun";
import { prisma } from "@/prisma/prisma";

export async function GET() {
  const user = await IsAuthenticated();
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const notifications = await prisma.notification.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return new Response(JSON.stringify(notifications), { status: 200 });
}

export async function POST(request: Request) {
  const { title, message, dueDate, hasReminder } = await request.json();
  const user = await IsAuthenticated();
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const notification = await Notification_Create(
    {
      title,
      message,
      dueDate,
      hasReminder,
    },
    user.id,
  );

  return new Response(JSON.stringify(notification), { status: 201 });
}

export async function DELETE(request: Request) {
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

  // delete notification from database
  await Notification_Delete(notificationId, user.id);

  return new Response(null, { status: 204 });
}
