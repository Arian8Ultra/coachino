import { GetUserId } from "@/auth/AuthFunctions";
import { prisma } from "@/prisma/prisma";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

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
    include: {
      chat: true,
    },
  });

  if (!task) {
    return new Response("Task not found", { status: 404 });
  }

  // Check if the task belongs to the user
  if (task.userId !== userId) {
    return new Response("Forbidden", { status: 403 });
  }

  // Check if the task is already have a chat
  if (task.chat) {
    const chat = await prisma.chat.findUnique({
      where: { id: task.chat.id },
      include: {
        Messages: true,
      },
    });
    if (!chat) {
      return new Response("Chat not found", { status: 404 });
    }
    return NextResponse.json({
      chatId: chat.id,
      messages: chat.Messages.map((m) => ({
        role: m.role,
        content: m.content,
        type: m.type,
        url: m.url,
        text: m.linkTitle, // Assuming linkTitle is used for link text
      })),
    });
  }

  // Create a new Chat tied to that task
  const newChat = await prisma.chat.create({
    data: {
      userId,
    },
  });
  await prisma.userTask.update({
    where: { id: taskId },
    data: {
      chatId: newChat.id,
    },
  });

  return NextResponse.json({
    chatId: newChat.id,
    messages: [],
  });
}
