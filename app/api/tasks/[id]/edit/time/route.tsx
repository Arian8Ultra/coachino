import { GetUserId } from "@/auth/AuthFunctions";
import { prisma } from "@/prisma/prisma";
import { cookies } from "next/headers";


export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }
  const userId = GetUserId(token);
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = (await request.json()) as { dueTime: string; taskId: string };
  if (!body.dueTime || !body.taskId) {
    return new Response("Bad Request", { status: 400 });
  }
  const dueTime = new Date(body.dueTime);
  if (isNaN(dueTime.getTime())) {
    return new Response("Invalid date format", { status: 400 });
  }
  const res = await prisma.userTask.update({
    where: {
      id: body.taskId,
      userId: userId,
    },
    data: {
      dueDate: dueTime,
    },
  });
  if (!res) {
    return new Response(
      "Task not found or you do not have permission to edit it",
      { status: 404 },
    );
  }
  return new Response(JSON.stringify(res), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
