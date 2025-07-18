import { Log } from "@/generated/prisma";
import { prisma } from "@/prisma/prisma";

export async function Log_Create(data: Log) {
  const log = await prisma.log.create({
    data: data,
  });

  if (!log) {
    throw new Error("Failed to create log entry");
  }
  return log;
}

export type Log_Create = Awaited<ReturnType<typeof Log_Create>>;

export async function Log_GetAll() {
  const logs = await prisma.log.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!logs) {
    throw new Error("No logs found");
  }
  return logs;
}
export type Log_GetAll = Awaited<ReturnType<typeof Log_GetAll>>;


export async function Log_GetById(id: string) {
  const log = await prisma.log.findUnique({
    where: { id },
  });

  if (!log) {
    throw new Error("Log entry not found");
  }
  return log;
}
export type Log_GetById = Awaited<ReturnType<typeof Log_GetById>>;

export async function Log_Update(id: string, data: Partial<Log>) {
  const log = await prisma.log.update({
    where: { id },
    data: data,
  });

  if (!log) {
    throw new Error("Failed to update log entry");
  }
  return log;
}
export type Log_Update = Awaited<ReturnType<typeof Log_Update>>;
export async function Log_Delete(id: string) {
  const log = await prisma.log.delete({
    where: { id },
  });

  if (!log) {
    throw new Error("Log entry not found");
  }
  return log;
}
export type Log_Delete = Awaited<ReturnType<typeof Log_Delete>>;


export async function Log_GetByUserId(userId: string) {
  const logs = await prisma.log.findMany({
    where: { userId },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!logs) {
    throw new Error("No logs found for this user");
  }
  return logs;
}
export type Log_GetByUserId = Awaited<ReturnType<typeof Log_GetByUserId>>;
export async function Log_GetByFunction(functionName: string) {
  const logs = await prisma.log.findMany({
    where: { function: functionName },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!logs) {
    throw new Error(`No logs found for function ${functionName}`);
  }
  return logs;
}
export type Log_GetByFunction = Awaited<ReturnType<typeof Log_GetByFunction>>;

export async function Log_GetByAction(action: string) {
  const logs = await prisma.log.findMany({
    where: { action },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!logs) {
    throw new Error(`No logs found for action ${action}`);
  }
  return logs;
}
export type Log_GetByAction = Awaited<ReturnType<typeof Log_GetByAction>>;
