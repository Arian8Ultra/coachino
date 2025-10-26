import { GetUserId } from "@/auth/AuthFunctions";
import { GenerateNewTask } from "@/function/scenario/Scenario";
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

  const body = (await request.json()) as {
    taskId: string;
    newTask: GenerateNewTask;
  };
  if (!body.taskId || !body.newTask) {
    return new Response("Bad Request", { status: 400 });
  }

  // 1) Ensure the task exists and belongs to the user
  const existing = await prisma.userTask.findFirst({
    where: { id: body.taskId, userId: userId },
  });
  if (!existing) {
    return new Response("Task not found or you do not have permission to edit it", { status: 404 });
  }

  // 2) Safely convert dueDate (handle null)
  const normalizedDueDate =
    body.newTask.dueDate
      ? new Date(body.newTask.dueDate as string | number | Date)
      : new Date();

  // 3) Update by id (ownership already verified)
  const res = await prisma.userTask.update({
    where: { id: body.taskId },
    data: {
      title: body.newTask.title,
      description: body.newTask.description,
      dueDate: normalizedDueDate, // either Date or null
      difficulty: body.newTask.difficulty,
      priority: body.newTask.priority,
    },
  });

  if (!res) {
    return new Response("Task not found or you do not have permission to edit it", { status: 404 });
  }
  return new Response(JSON.stringify(res), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
