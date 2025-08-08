/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
// app/api/chat/route.ts
import { GetUserId } from "@/auth/AuthFunctions";
import { prisma } from "@/prisma/prisma";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: NextRequest) {
  const { chatId, messages, examId } = (await req.json()) as {
    chatId: string;
    messages: { role: string; content: string }[];
    examId?: string;
  };

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

  // 2. Persist user messages
  const userMsgs = messages
    .filter((m) => m.role === "user")
    .map((m) => ({
      chatId,
      userId,
      role: "user",
      content: m.content,
    }));
  if (userMsgs.length) {
    await prisma.message.createMany({ data: userMsgs });
  }

  // 3. Call OpenAI
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: messages as any[],
  });
  const assistant = completion.choices[0].message!;

  // 4. Persist assistant reply
  await prisma.message.create({
    data: {
      chatId,
      userId,
      role: "assistant",
      content: assistant.content || "",
      type: "text", // Assuming this is a text message
      url: assistant.content?.includes("http")
        ? assistant.content.match(/https?:\/\/[^\s]+/)?.[0] || null
        : null, // Extract URL if present
      linkTitle: assistant.content?.includes("http")
        ? assistant.content.match(/>([^<]+)<\/a>/)?.[1] || null
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
    : `/panel/exams/${chatRecord?.UserExamResult?.examId || examId}/scenarios`;

  let extra: any[] = [];
  if (totalMessages >= 5 || wantsScenarios) {
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

  return NextResponse.json({
    chatId,
    messages: [assistant, ...extra],
  });
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const chatId = url.searchParams.get("chatId");
  if (!chatId) {
    return NextResponse.json({ error: "Chat ID is required" }, { status: 400 });
  }
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const userId = GetUserId(token);
  if (!userId) {
    return NextResponse.json({ error: "Invalid user" }, { status: 401 });
  }

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
