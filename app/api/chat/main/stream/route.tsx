/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/chat/main/route.ts
import { checkUserMonthlyLimit, GetUserId, IsAuthenticated } from "@/auth/AuthFunctions";
import { decodeMessage, encodeMessage } from "@/auth/Encoder";
import { newBuildTools } from "@/function/ai/MainChatFunctions";
import { prisma } from "@/prisma/prisma";
import { openai } from "@ai-sdk/openai";
import {
  AssistantModelMessage,
  ModelMessage,
  streamText,
  UserModelMessage,
  stepCountIs,
} from "ai";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

const GAURD = `
1. You are Coachino's AI assistant, designed to help users improve themselves through personalized coaching.
2. Always prioritize user privacy and data security
3. dont generate any id on your own for question ids or scenario ids use the tools provided to you to get question ids and scenario ids
4. if the user has not any exam result start the exam for the user automaticly by calling the getNotAnsweredQuestions tool and just return the quesiton id in the meta and set the type of the message as 'question' if the user didnt take an exam use the getNotAnsweredQuestions tool to get the question ids if the user asked for anything else dont answer it and just start the exam for the user and say من برای پاسخ به سوالاتت نیاز دارم بشنامت پس بیا با هم یک آزمون کوتاه بدیم. شروع کنیم؟
5. if user provides any personal information like name age etc store them in the user profile using the updateUserProfile tool
6. dont generate scenario recommendation on your own use the tool named generateRecommendedScenarios to get recommended scenarios for the user and just return the scenarios in the meta data and set the type of the message as 'scenario_recommendation'
7. just use 'scenario_recommendation' as type when you are returning recommended scenarios for the user.
8. user the 'question' type when you are returning a valid question id for the user to answer.
9. always answer in persian language.
`;

const getQuestions = async () => {
  "use cache";
  const exam = await prisma.exam.findFirst({ where: { useForChat: true } });
  if (exam) {
    const questions = await prisma.question.findMany({
      where: { examId: exam.id },
      select: { id: true },
    });
    return questions;
  }
  return null;
};

export async function POST(req: NextRequest) {
  // ── Parse input
  const {
    messages,
  }: {
    messages: {
      role: "user" | "assistant" | "system";
      content: string;
      metaData?: { questionId?: string };
    }[];
  } = await req.json();

  // ── Auth
  const user = await IsAuthenticated();
  if (!user)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const userId = user.id;
  if (!userId)
    return NextResponse.json({ error: "Invalid user" }, { status: 401 });

  if (!(await checkUserMonthlyLimit(user))) {
    return NextResponse.json(
      { error: "Monthly limit reached. Please upgrade your plan." },
      { status: 403 },
    );
  }

  // ── Ensure main chat exists
  const mainChat = await prisma.chat.findFirst({
    where: { userId, isMain: true },
  });
  const chatId = mainChat
    ? mainChat.id
    : (await prisma.chat.create({ data: { userId, isMain: true } })).id;

  // ── Persist latest user message (dedup + encoding)
  const userMsgs = messages
    .filter((m) => m.role === "user")
    .map((m) => ({
      chatId,
      userId,
      role: "user" as const,
      content: m.content,
    }));

  if (userMsgs.length) {
    const chatMessages = await prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: "asc" },
      select: { role: true, content: true },
    });

    const lastUserMsg = userMsgs[userMsgs.length - 1];
    const isDuplicate =
      chatMessages.length > 0 &&
      chatMessages[chatMessages.length - 1].role === "user" &&
      chatMessages[chatMessages.length - 1].content === lastUserMsg.content;

    if (!isDuplicate) {
      const encodedContent = encodeMessage(lastUserMsg.content, userId);
      await prisma.message.create({
        data: { ...lastUserMsg, content: encodedContent },
      });
    }
  }

  // ── Prep context & model
  const last10Messages = messages.slice(-10);
  const userExamResults = await prisma.userExamResult.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 3,
    select: { id: true },
  });

  const chosenModel =
    userExamResults.length > 0 ? openai("o3-mini") : openai("o3-mini");

  // ── Build AI messages
  const aiMessages = last10Messages.map((m) =>
    m.role === "user"
      ? ({ role: "user", content: m.content } as UserModelMessage)
      : m.role === "assistant"
      ? ({ role: "assistant", content: m.content } as AssistantModelMessage)
      : ({ role: "system", content: m.content } as ModelMessage),
  );

  // ── Kick off streaming generation
  const result = streamText({
    model: chosenModel,
    messages: aiMessages,
    stopWhen: stepCountIs(10),
    system: GAURD,
    tools: newBuildTools(userId),
    providerOptions: {
      openai: {
        reasoningEffort: userExamResults.length > 0 ? "medium" : "minimal",
        user: userId,
      },
    },
    // If you want structured output at the end too, you can add experimental_output here.
    // experimental_output: Output.object({ schema: ... }),
    experimental_telemetry: { isEnabled: true },
  });

  // ── Wire up a passthrough stream that:
  //    1) forwards chunks to client in real-time
  //    2) accumulates full text for DB save on completion
  const encoder = new TextEncoder();
  let fullText = "";

  // We also optionally send a small JSON trailer with metadata after saving.
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const reader = result.textStream.getReader();

        // Send an opening event if your frontend expects it (optional).
        // controller.enqueue(encoder.encode("event: open\ndata: {}\n\n"));

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          if (value) {
            fullText += value;
            // Stream plain text chunks (you can wrap in SSE if you prefer)
            controller.enqueue(encoder.encode(value));
          }
        }

        // ── Generation finished. Decide type/meta, then persist.
        const questions = await getQuestions();
        let type: "text" | "question" | "scenario_recommendation" | "link" =
          "text";
        const metaData: any = undefined;

        // If you keep experimental_output above, you can read it here (pseudo):
        // const finalOutput = await result.response; // implementation detail depends on ai sdk version
        // const questionId = finalOutput?.experimental_output?.metaData?.questionId ?? null;
        // const scenarios = finalOutput?.experimental_output?.metaData?.scenarios ?? null;

        // Basic, safe fallback: detect link to scenarios & convert later (keeps your old behavior):
        // (You can replace this with the experimental_output block if you enable it.)
        if (/#\/panel\/scenarios\//.test(fullText)) {
          type = "link"; // you also add a link message below (same as your previous logic)
        }

        // Persist assistant message AFTER stream has finished
        const encodedAssistantMessage = encodeMessage(fullText || " ", userId);

        const saved = await prisma.message.create({
          data: {
            chatId,
            userId,
            role: "assistant",
            content: encodedAssistantMessage,
            type, // "text" by default; adjust if you enable structured output
            url: fullText?.includes("http")
              ? fullText.match(/https?:\/\/[^\s]+/)?.[0] || null
              : null,
            metaData, // set once you enable structured output above
            linkTitle: fullText?.includes("http")
              ? fullText.match(/>([^<]+)<\/a>/)?.[1] || null
              : null,
          },
        });

        // Optional: if you detect a #/panel/scenarios/... link, create a separate link message (kept from your code)
        if (fullText.includes("#/panel/scenarios/")) {
          const link = fullText.match(/#\/panel\/scenarios\/[^\s]+/)?.[0] || "";
          const scenarioName = await prisma.scenario.findFirst({
            where: { id: link?.split("/").pop(), userId },
            select: { name: true },
          });
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

        // Optionally send a tiny JSON trailer indicating “saved”
        const trailer = JSON.stringify({
          status: "saved",
          chatId,
          messageId: saved.id,
        });
        controller.enqueue(encoder.encode(`\n\n${trailer}`));

        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });

  // Return a streaming response
  return new NextResponse(stream, {
    headers: {
      // Choose one your frontend expects. Plain text chunks are simplest:
      "Content-Type": "text/plain; charset=utf-8",
      // Allow streaming in edge/node runtimes:
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      // If you’re behind proxies, this helps prevent buffering:
      "X-Accel-Buffering": "no",
    },
  });
}

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const userId = GetUserId(token);
  // console.log("userId", userId);

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
    let existingMessages = await prisma.message.findMany({
      where: { chatId: existingChat.id },
      orderBy: { createdAt: "asc" },
    });

    if (existingMessages.length === 0) {
      // if no messages, create a welcome message from assistant
      const res = streamText({
        model: openai("gpt-4o-mini"),
        messages: [
          {
            role: "system",
            content: `You are a helpful assistant named Coachino initialize a new chat for the user and greet the user and use the tools below if you need to get any information about the user. ask the user if they want to take an exam and start the exam,the first exam is nessesary for all users. push the user to take the exam. write everything in persian.start with a greeting like this:
            سلام! من کوچینو هستم. میخوام بهت کمک کنم تا بهترین نسخه از خودت باشی. برای شروع باید بشناسمت. آماده‌ای که با هم یک آزمون کوتاه بدیم؟`,
          },
        ],
        stopWhen: stepCountIs(5),
        maxRetries: 2,
        system: `You are a helpful assistant named Coachino initialize a new chat for the user and greet the user and use the tools below if you need to get any information about the user. write everything in persian.`,
        tools: newBuildTools(userId),
      });
      let assistant = await res.text;
      if (!assistant || assistant.trim().length === 0) {
        assistant = "سلام! من کوچینو هستم. چطور می‌تونم کمکتون کنم؟";
      }
      const encodedAssistantMessage = encodeMessage(assistant, userId);
      const message = await prisma.message.create({
        data: {
          chatId: existingChat.id,
          userId,
          role: "assistant",
          content: encodedAssistantMessage || "",
          type: "text", // Assuming this is a text message
          url: assistant?.includes("http")
            ? assistant.match(/https?:\/\/[^\s]+/)?.[0] || null
            : null, // Extract URL if present
          linkTitle: assistant?.includes("http")
            ? assistant.match(/>([^<]+)<\/a>/)?.[1] || null
            : null, // Extract link title if present
        },
      });
      // console.log("Assistant message created:", message);
      return NextResponse.json({
        chatId: existingChat.id,
        messages: [
          {
            role: "assistant",
            content: decodeMessage(message.content, userId),
            type: "text", // Assuming this is a text message
            url: message?.url,
            linkTitle: message?.linkTitle,
          },
        ],
      });
    }
    existingMessages = await prisma.message.findMany({
      where: { chatId: existingChat.id },
      orderBy: { createdAt: "asc" },
    });
    // console.log("existingMessages", existingMessages);

    return NextResponse.json({
      chatId: existingChat.id,
      messages: existingMessages.map((m) => ({
        role: m.role,
        content: decodeMessage(m.content, userId),
        type: m.type,
        url: m.url,
        text: m.linkTitle, // Assuming linkTitle is used for link text
        expectedAnswers: m.expectedAnswers,
        expectedAnswerType: m.expectedAnswerType,
        metaData: m.metaData,
      })),
    });
  }

  return NextResponse.json({ chatId, messages: [] });
}
