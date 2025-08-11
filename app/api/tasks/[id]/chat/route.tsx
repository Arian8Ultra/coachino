/* eslint-disable @typescript-eslint/no-explicit-any */
import { GetUserId } from "@/auth/AuthFunctions";
import { prisma } from "@/prisma/prisma";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(request: Request) {
  const { messages, taskId } = (await request.json()) as {
    messages: {
      role: "function" | "user" | "developer" | "system" | "assistant" | "tool";
      content: string;
    }[];
    taskId?: string;
  };
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }
  const userId = GetUserId(token);
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (!taskId) {
    return new Response("Task ID is required", { status: 400 });
  }
  const task = await prisma.userTask.findUnique({
    where: { id: taskId },
    include: {
      chat: {
        include: {
          Messages: true,
        },
      },
    },
  });

  if (!task) {
    return new Response("Task not found", { status: 404 });
  }

  // Check if the task belongs to the user
  if (task.userId !== userId) {
    return new Response("Forbidden", { status: 403 });
  }

  const res = await openai.chat.completions.create({
    model: "o3",
    messages: [
      ...(messages as any[]),
      {
        role: "system",
        content: `You are a helpful assistant for a task that is ${JSON.stringify(
          task,
        )}.`,
      },
    ],
  });

    if (!res.choices || res.choices.length === 0) {
        return new Response("No response from OpenAI", { status: 500 });
    }

    const assistant = res.choices[0].message!;
    if (!assistant) {
        return new Response("No assistant message found", { status: 500 });
    }
    // Persist the assistant's reply
    await prisma.message.create({
      data: {
        chatId: task.chat?.id || "",
        userId,
        role: assistant.role,
        content: assistant.content || "",
        type: "text",
      },
    });


    return NextResponse.json({
      chatId: task.chat?.id || "",
      messages: [
        ...task.chat?.Messages.map((m) => ({
          role: m.role,
          content: m.content,
          type: m.type,
          url: m.url,
          text: m.linkTitle, // Assuming linkTitle is used for link text
        })) || [],
        {
          role: assistant.role,
          content: assistant.content || "",
          type: "text",
        },
      ],
    });
}
