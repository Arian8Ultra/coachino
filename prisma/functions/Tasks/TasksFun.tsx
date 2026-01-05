import { prisma } from "@/prisma/prisma";

export async function Tast_GetUserTasks(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    console.error("User not found");

    return [];
  }

  const userTasks = await prisma.userTask.findMany({
    where: {
      userId: userId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      Scenario: true,
    },
  });

  if (!userTasks) {
    console.error("No tasks found for user", userId);
    return [];
  }

  return userTasks;
}

export type Tast_GetUserTasks = Awaited<ReturnType<typeof Tast_GetUserTasks>>;



export async function Task_GetById(taskId: string) {
  const task = await prisma.userTask.findUnique({
    where: { id: taskId },
    include: {
      Scenario: true,
    },
  });

  if (!task) {
    console.error("Task not found with ID:", taskId);
    return null;
  }

  return task;
}

export type Task_GetById = Awaited<ReturnType<typeof Task_GetById>>;







