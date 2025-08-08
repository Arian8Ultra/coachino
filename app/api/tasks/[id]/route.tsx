import { GetUserId } from "@/auth/AuthFunctions";
import { prisma } from "@/prisma/prisma";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }
  const userId = GetUserId(token);
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const url = new URL(request.url);
  const taskId = url.searchParams.get("taskId");
  if (!taskId) {
    return new Response("Task ID is required", { status: 400 });
  }
  const task = await prisma.userTask.findUnique({
    where: { id: taskId },
  });
  if (!task) {
    return new Response("Task not found", { status: 404 });
  }

  // Check if the task belongs to the user
  if (task.userId !== userId) {
    return new Response("Forbidden", { status: 403 });
  }
  return new Response(JSON.stringify(task), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function DELETE(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }
  const userId = GetUserId(token);
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await request.json();
  const { taskId } = body;
  if (!taskId) {
    return new Response("Task ID is required", { status: 400 });
  }

  const task = await prisma.userTask.findUnique({
    where: { id: taskId },
  });

  if (!task) {
    return new Response("Task not found", { status: 404 });
  }

  // Check if the task belongs to the user
  if (task.userId !== userId) {
    return new Response("Forbidden", { status: 403 });
  }

  await prisma.userTask.delete({
    where: { id: taskId },
  });

  return new Response("Task deleted successfully", { status: 200 });
}
