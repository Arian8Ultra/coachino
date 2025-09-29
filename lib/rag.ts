import { prisma } from "@/prisma/prisma";
import { z } from "zod";
import { TaskPriority, TaskStatus } from "@/generated/prisma";

export async function GetUserData(userId: string) {
  const userData = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
    },
  });

  const userExamResults = await prisma.userExamResult.findMany({
    where: {
      userId: userId,
    },
    // include: { exam: true },
    select: {
      id: true,
      score: true,
      description: true,
      createdAt: true,
      exam: {
        select: {
          id: true,
          name: true,
        },
      },
      details: true,
      resultJson: true,
      result: true,
    },
  });

  const userTasks = await prisma.userTask.findMany({
    where: { userId },
    select: {
      id: true,
      title: true,
      description: true,
      dueDate: true,
      priority: true,
      status: true,
      startDate: true,
      difficulty: true,
      isDelayed: true,
    },
  });

  const userScenarios = await prisma.scenario.findMany({
    where: { userId },
    select: {
      approximateTime: true,
      name: true,
      id: true,
      description: true,
      details: true,
      createdAt: true,
    },
  });

  return { userData, userExamResults, userTasks, userScenarios };
}

export type UserDataType = Awaited<ReturnType<typeof GetUserData>>;



export const UserDataSchema = z.object({
  userData: z
    .object({
      name: z.string(),
      id: z.string(),
    })
    .nullable(),

  userExamResults: z.array(
    z.object({
      result: z.string(),
      id: z.string(),
      createdAt: z.date(),
      score: z.string(),
      description: z.string().nullable(),
      details: z.string().nullable(),
      resultJson: z.string().nullable(),
      exam: z.object({
        name: z.string(),
        id: z.string(),
      }),
    }),
  ),

  userTasks: z.array(
    z.object({
      status: z.enum(TaskStatus),
      id: z.string(),
      title: z.string(),
      description: z.string().nullable(),
      startDate: z.date(),
      priority: z.enum(TaskPriority),
      difficulty: z.number().nullable(),
      isDelayed: z.boolean(),
      dueDate: z.date(),
    }),
  ),

  userScenarios: z.array(
    z.object({
      name: z.string(),
      id: z.string(),
      createdAt: z.date(),
      description: z.string().nullable(),
      details: z.string().nullable(),
      approximateTime: z.number().nullable(),
    }),
  ),
});

export type UserDataTypeZod = z.infer<typeof UserDataSchema>;
