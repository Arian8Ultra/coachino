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
  //   check if the task belongs to the user
  if (task.userId !== userId) {
    return new Response("Forbidden", { status: 403 });
  }
  //   mark the task as done
  const updatedTask = await prisma.userTask.update({
    where: { id: taskId },
    data: {
      status: "COMPLETED",

      isDelayed: new Date() > task.dueDate ? true : false,
    },
  });
  if (!updatedTask) {
    return new Response("Failed to update task", { status: 500 });
  }
  return new Response(JSON.stringify(updatedTask), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

