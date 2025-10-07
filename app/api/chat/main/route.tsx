/* eslint-disable @typescript-eslint/no-unused-vars */
//app/api/chat/main
import { GetUserId } from "@/auth/AuthFunctions";
import { buildTools } from "@/function/ai/MainChatFunctions";
import { GetUserData, UserDataSchema } from "@/lib/rag";
import { prisma } from "@/prisma/prisma";
import { openai } from "@ai-sdk/openai";
import {
  AssistantModelMessage,
  generateText,
  ModelMessage,
  stepCountIs,
  streamText,
  tool,
  UserModelMessage,
} from "ai";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
export async function POST(req: NextRequest) {
  const {
    messages,
  }: {
    messages: {
      role: "user" | "assistant" | "system";
      content: string;
    }[];
  } = await req.json();

  console.log("Received messages:", messages);

  // 1. Auth
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const userId = GetUserId(token);
  if (!userId) {
    return NextResponse.json({ error: "Invalid user" }, { status: 401 });
  }

  const mainChat = await prisma.chat.findFirst({
    where: { userId, isMain: true },
  });

  const chatId = mainChat
    ? mainChat.id
    : (
        await prisma.chat.create({
          data: { userId, isMain: true },
        })
      ).id;

  const userMsgs = messages
    .filter((m) => m.role === "user")
    .map((m) => ({
      chatId,
      userId,
      role: "user",
      content: m.content,
    }));
  if (userMsgs.length) {
    const chatMessages = await prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: "asc" },
    });
    if (chatMessages.length > 0) {
      const lastMessage = chatMessages[chatMessages.length - 1];
      if (
        lastMessage.role === "user" &&
        lastMessage.content === userMsgs[0].content
      ) {
        console.log("Duplicate user message, skipping OpenAI call");
      } else {
        await prisma.message.create({
          data: userMsgs[0],
        });
      }
    } else {
      await prisma.message.create({
        data: userMsgs[0],
      });
    }
  }

  // 3. Call OpenAI
  const res = streamText({
    model: openai("o3-mini"),
    model: openai("o3-mini"),
    messages: [
      ...messages.map((m) =>
        m.role === "user"
          ? ({
              role: "user",
              content: m.content,
            } as UserModelMessage)
          : m.role == "assistant"
          ? ({ role: "assistant", content: m.content } as AssistantModelMessage)
          : ({ role: "system", content: m.content } as ModelMessage),
      ),
    ],
    stopWhen: stepCountIs(10),
    maxRetries: 2,

    system: `You are a helpful assistant. Check your knowledge base before answering any questions.
    if you need to get any information about the user use the tools below.
    and also answer everything in persian if the answer has any other language translate it to persian.`,
    tools: buildTools(userId),
  });
  // console.log("OpenAI response:", JSON.stringify(res));

  let assistant = await res.text;

  console.log("Assistant response:", assistant);

  if (!assistant || assistant.trim().length === 0) {
    return NextResponse.json(
      { error: "No response from assistant" },
      { status: 500 },
    );
  }

  // 4. Persist assistant reply
  await prisma.message.create({
    data: {
      chatId,
      userId,
      role: "assistant",
      content: assistant || "",
      type: "text", // Assuming this is a text message
      url: assistant?.includes("http")
        ? assistant.match(/https?:\/\/[^\s]+/)?.[0] || null
        : null, // Extract URL if present
      linkTitle: assistant?.includes("http")
        ? assistant.match(/>([^<]+)<\/a>/)?.[1] || null
        : null, // Extract link title if present
    },
  });

  // if the assistant message contains a link to scenarios with a # before it, remove the # and make it a link message

  if (assistant.includes("#/panel/scenarios/")) {
    const link = assistant.match(/#\/panel\/scenarios\/[^\s]+/)?.[0] || "";
    const scenarioName = await prisma.scenario.findFirst({
      where: { id: link?.split("/").pop(), userId },
      select: { name: true },
    });
    if (scenarioName) {
      assistant = assistant
        .replace(link, `/panel/scenarios/${link?.split("/").pop()}`)
        .replaceAll("(", "")
        .replaceAll(")", ""); // remove any parentheses around the link
    }
    await prisma.message.create({
      data: {
        chatId,
        userId,
        role: "assistant",
        content: `برای مشاهده سناریو روی دکمه زیر کلیک کنید:`,
        type: "link",
        url: link.replace("#", ""),
        linkTitle: scenarioName?.name || "مشاهده سناریو",
      },
    });
  }

  return NextResponse.json({
    chatId,
    messages: [
      {
        role: "assistant",
        content: assistant,
        type: "text",
        url: assistant?.includes("http")
          ? assistant.match(/https?:\/\/[^\s]+/)?.[0] || null
          : null,
        text: assistant?.includes("http")
          ? assistant.match(/>([^<]+)<\/a>/)?.[1] || null
          : null, // Extract link title if present
      },
    ],
  });
}

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const userId = GetUserId(token);
  if (!userId) {
    return NextResponse.json({ error: "Invalid user" }, { status: 401 });
  }

  const mainChat = await prisma.chat.findFirst({
    where: { userId, isMain: true },
  });

  const chatId = mainChat
    ? mainChat.id
    : (
        await prisma.chat.create({
          data: { userId, isMain: true },
        })
      ).id;

  // Fetch messages for the chat
  const existingChat = await prisma.chat.findFirst({
    where: { id: chatId },
  });
  if (existingChat) {
    // Check if the chat belongs to the user
    if (existingChat.userId !== userId) {
      return NextResponse.json(
        { error: "You do not have access to this chat" },
        { status: 403 },
      );
    }
    const existingMessages = await prisma.message.findMany({
      where: { chatId: existingChat.id },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({
      chatId: existingChat.id,
      messages: existingMessages.map((m) => ({
        role: m.role,
        content: m.content,
        type: m.type,
        url: m.url,
        text: m.linkTitle, // Assuming linkTitle is used for link text
      })),
    });
  }
  return NextResponse.json({ error: "Chat not found" }, { status: 404 });
}
