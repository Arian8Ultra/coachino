/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
// app/api/chat/route.ts
import { GetUserId } from "@/auth/AuthFunctions";
import { GetUserData, UserDataSchema } from "@/lib/rag";
import { prisma } from "@/prisma/prisma";
import { openai } from "@ai-sdk/openai";
import { generateText, tool } from "ai";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
export async function POST(req: NextRequest) {
  const {
    messages,
    query: message,
  }: {
    messages: {
      role: "user" | "assistant" | "system";
      content: string;
    }[];
    query: string;
  } = await req.json();

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
        await prisma.message.createMany({
          data: userMsgs,
        });
      }
    } else {
      await prisma.message.createMany({
        data: userMsgs,
      });
    }
  }

  // 3. Call OpenAI
  const { text } = await generateText({
    model: openai("gpt-4o"),
    messages: [
      ...messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      {
        role: "user",
        content: message,
      },
    ],
    tools: {
      getUserData: tool({
        name: "getUserData",
        description:
          "Get user data like name, age, tasks,scenarios and etc. You must use this function to get user data. And you should answer in Persian an according to user data.",
        inputSchema: z.object({
          userId: z.string(),
        }),
        outputSchema: UserDataSchema,
        execute: async ({ userId }) => GetUserData(userId),
      }),
    },
  });
  const assistant = text;

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

  // 5. Determine if we should inject “View Scenarios” link
  const totalMessages = messages.length + 1; // include this assistant
  const lastUserMessage =
    messages.filter((m) => m.role === "user").slice(-1)[0]?.content || "";
  const wantsScenarios = /plan|scenario|scenarios|طرح|سناریو/i.test(
    lastUserMessage,
  );

  // Fetch chat record to get linked exam result
  const chatRecord = await prisma.chat.findUnique({
    where: { id: chatId },
    include: {
      UserExamResult: {
        select: { id: true, examId: true },
      },
    },
  });
  const resultId = chatRecord?.userExamResultId;
  const scenariosUrl = resultId
    ? `/panel/exams/${chatRecord.UserExamResult?.examId}/${resultId}/scenarios`
    : `/panel/exams/${chatRecord?.UserExamResult?.examId}/scenarios`;

  let extra: any[] = [];
  if (totalMessages >= 5 || wantsScenarios) {
    // check if we had a link message already
    const existingLinkMessage = await prisma.message.findFirst({
      where: {
        chatId,
        role: "assistant",
        type: "link",
        url: scenariosUrl,
      },
    });

    if (!existingLinkMessage) {
      const linkMsg = {
        role: "assistant",
        content: "برای مشاهده سناریوهای پیشنهادی روی دکمه زیر کلیک کنید:",
        // @ts-ignore
        type: "link",
        url: scenariosUrl,
        text: "مشاهده سناریوها",
      };
      extra.push(linkMsg);

      // persist link message
      await prisma.message.create({
        data: {
          chatId,
          userId,
          role: "assistant",
          content: linkMsg.content,
          type: linkMsg.type,
          url: linkMsg.url,
          linkTitle: linkMsg.text,
        },
      });
    }
  }

  return NextResponse.json({
    chatId,
    messages: [assistant, ...extra],
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
