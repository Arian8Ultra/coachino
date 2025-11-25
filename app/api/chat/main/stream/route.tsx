/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/chat/main/route.ts
import {
  checkUserMonthlyLimit,
  GetUserId,
  IsAuthenticated,
} from "@/auth/AuthFunctions";
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
  Output,
} from "ai";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

const GAURD = `
1. You are Coachino's AI assistant, designed to help users improve themselves through personalized coaching.\n
2. Always prioritize user privacy and data security\n
3. dont generate any id on your own for question ids or scenario ids use the tools provided to you to get question ids and scenario ids\n
4. if the user has not any exam result (get it from the tools) start the exam for the user automaticly by calling the getNotAnsweredQuestions tool and just return the quesiton id in the meta and set the type of the message as 'question' if the user didnt take an exam use the getNotAnsweredQuestions tool to get the question ids if the user asked for anything else dont answer it and just start the exam for the user and say من برای پاسخ به سوالاتت نیاز دارم بشنامت پس بیا با هم یک آزمون کوتاه بدیم. شروع کنیم؟\n
5. if user provides any personal information like name age etc store them in the user profile using the updateUserProfile tool\n
6. dont generate scenario recommendation on your own use the tool named generateRecommendedScenarios to get recommended scenarios for the user and just return the scenarios in the meta data and set the type of the message as 'scenario_recommendation' make sure that you set the type as this 'scenario_recommendation' \n
7. just use 'scenario_recommendation' as type when you are returning recommended scenarios for the user.
8. user the 'question' type when you are returning a valid question id for the user to answer.\n
9. always answer in persian language.\n
10. dont generate any id on your own for question ids or scenario ids use the tools provided to you to get question ids and scenario ids\n
11. for the exam and the question dont navigate the user to another page use the type 'question' and provide the question id in the meta data\n
12. after the user has answered all the questions in the exam congratulate the user and provide the exam result summary using the tools  provided to you\n
- **Absolutely do NOT output any strings like "", "turn0search0", "turn1search5" or similar.**
- If the web search tool provides citations or IDs, IGNORE them and do not copy them into the answer.
- Always respond in Persian.
- Make the links clickable in the markdown by using the format [link title](url).
13. **When using web search tool, change the type to 'web_search'**
14. in the user message if there is any meta data provided use it to fullfil the user request
15. in the text part of the answer dont include any meta data information or instructions just provide the pure text answer no id or meta data information in the text answer.
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

const userHasAnsweredQuestions = async (userId: string) => {
  const exam = await prisma.exam.findFirst({ where: { useForChat: true } });
  if (exam) {
    const questions = await prisma.question.findMany({
      where: { examId: exam.id },
      select: { id: true },
    });
    const questionIds = questions.map((q) => q.id);
    const answeredCount = await prisma.userAnswer.count({
      where: {
        userId,
        questionId: { in: questionIds },
      },
    });
    return answeredCount === questionIds.length;
  }
  return false;
};

export async function POST(req: NextRequest) {
  // ── Parse input
  const {
    messages,
    deepAnalysis,
  }: {
    messages: {
      role: "user" | "assistant" | "system";
      content: string;
      metaData?: { questionId?: string; taskId?: string };
    }[];
    deepAnalysis?: boolean;
  } = await req.json();

  // log the metadata for the last message
  console.log(
    "Last message metaData:",
    messages[messages.length - 1]?.metaData,
  );

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

  const userSubscription = await prisma.userSubscription.findFirst({
    where: {
      userId: user.id,
      isActive: true,
      endDate: {
        gte: new Date(),
      },
    },
    include: {
      subscription: true,
    },
  });

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
      metaData: m.metaData,
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
      const taskId = lastUserMsg.metaData?.taskId;
      await prisma.message.create({
        data: { ...lastUserMsg, content: encodedContent, metaData: { taskId } },
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

  const chosenModel = deepAnalysis ? openai("gpt-5.1") : openai("gpt-5.1");

  // ── Build AI messages
  const aiMessages = last10Messages.map((m) =>
    m.role === "user"
      ? ({
          role: "user",
          content:
            m.content +
            (m.metaData ? ` metaData: ${JSON.stringify(m.metaData)}` : ""),
        } as UserModelMessage)
      : m.role === "assistant"
      ? ({
          role: "assistant",
          content:
            m.content +
            (m.metaData ? ` metaData: ${JSON.stringify(m.metaData)}` : ""),
        } as AssistantModelMessage)
      : ({
          role: "system",
          content:
            m.content +
            (m.metaData ? ` metaData: ${JSON.stringify(m.metaData)}` : ""),
        } as ModelMessage),
  );

  console.log(
    "userHasAnsweredQuestions",
    await userHasAnsweredQuestions(userId),
  );

  const ScenarioSchema = z.object({
    name: z.string(),
    id: z.string(),
    userId: z.string(),
    description: z.string().nullable(),
    details: z.string().nullable(),
    chatId: z.string().nullable(),
    approximateTime: z.number().nullable(),
    examResultId: z.string().nullable(),
    chosenByCoachino: z.boolean().optional().default(false),
    chosenByUser: z.boolean().optional().default(false),
  });

  const MetaDataSchema = z.object({
    questionId: z.string().nullable().optional(), // ✅ can be string | null | undefined
    taskId: z.string().nullable().optional(), // (if you use taskId at all)
    scenarios: z.array(ScenarioSchema).nullable().optional(), // ✅ array | null | undefined
  });
  // ── Kick off streaming generation
  const { experimental_partialOutputStream } = streamText({
    model: chosenModel,
    messages: aiMessages,
    stopWhen: stepCountIs(12),
    system:
      GAURD +
      ((await userHasAnsweredQuestions(userId))
        ? "کاربر آزمون اولیه را انجام داده است. می‌توانید به سوالات او پاسخ دهید."
        : ""),
    tools: newBuildTools(userId),
    activeTools: [
      "getTasks",
      "getExamResults",
      "getUserSenarios",
      "getScenarioLink",
      "getUserData",
      "getUserProfile",
      "updateUserProfile",
      "addMultipleUserProfileParams",
      "getUserInfo",
      "generateExamLink",
      "getNotAnsweredQuestions",
      "submitExamAnswers",
      "getQuestionDetailsById",
      "generateRecommendedScenarios",
      "getRecommendedScenarios",
      "saveAScenarioForUser",
      "addATaskToScenario",
      "updateTask",
      "addMultipleTasksForUser",
      "checkIfUserAnsweredAllQuestions",
      "generateTasksForScenario",
      "addNotificationToUser",
      "getUserNotifications",
      "deleteUserNotification",
      "deleteUserTask",
      "deleteManyUserTasks",
      userSubscription?.subscription.options.includes("SOURCE_PROVIDED")
        ? "web_search"
        : "userDoesNotHaveWebSearchAccess",
    ],

    providerOptions: {
      openai: {
        user: userId,
        reasoningEffort: userExamResults.length > 0 ? "medium" : "low",
        serviceTier: "priority",
      },
    },
    experimental_output: Output.object({
      schema: z.object({
        assistantMessage: z.string(),
        type: z
          .enum([
            "text",
            "link",
            "question",
            "scenario_recommendation",
            "web_search",
          ])
          .or(z.string()),
        metaData: MetaDataSchema.optional(),
      }),
    }),
    experimental_telemetry: { isEnabled: true },
  });

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // We stream ONLY assistantMessage from the experimental partial output.
        const outputReader = experimental_partialOutputStream?.getReader();
        if (!outputReader) {
          controller.error(new Error("No partial output stream available."));
          return;
        }

        let lastAssistant = "";
        let finalObj: any = null;

        // 1) Stream ONLY the delta of assistantMessage
        while (true) {
          const { done, value } = await outputReader.read();
          if (done) break;

          // value is the partial structured object (same shape as schema) but partial
          finalObj = value; // keep latest snapshot for finalization
          const curr = value?.assistantMessage ?? "";

          // compute delta and send
          if (curr.length > lastAssistant.length) {
            const delta = curr.slice(lastAssistant.length);
            controller.enqueue(encoder.encode(delta));
            lastAssistant = curr;
          }
        }

        // 2) Build the final structured payload
        // fallback if the model didn't fill something
        const payloadRaw = {
          assistantMessage: finalObj?.assistantMessage ?? lastAssistant ?? "",
          type: finalObj?.type ?? "text",
          metaData: finalObj?.metaData ?? undefined,
        };

        // validate against the same schema
        const StructuredSchema = z.object({
          assistantMessage: z.string(),
          type: z
            .enum(["text", "link", "question", "scenario_recommendation"])
            .or(z.string()),
          metaData: MetaDataSchema.optional(),
        });

        const payload = StructuredSchema.parse(payloadRaw);

        // 3) Persist AFTER stream is done
        const questions = await getQuestions();
        const isQuestionValid =
          !!payload.metaData?.questionId &&
          !!questions?.find((q) => q.id === payload.metaData!.questionId);

        const saved = await prisma.message.create({
          data: {
            chatId,
            userId,
            role: "assistant",
            content: encodeMessage(payload.assistantMessage || " ", userId),
            type: isQuestionValid
              ? "question"
              : payload.metaData?.scenarios?.length
              ? "scenario_recommendation"
              : payload.type === "link"
              ? "link"
              : "text",
            url: payload.assistantMessage.includes("http")
              ? payload.assistantMessage.match(/https?:\/\/[^\s]+/)?.[0] || null
              : null,
            metaData: payload.metaData,
            linkTitle: payload.assistantMessage.includes("http")
              ? payload.assistantMessage.match(/>([^<]+)<\/a>/)?.[1] || null
              : null,
          },
        });

        // keep your special link behavior
        if (payload.assistantMessage.includes("#/panel/scenarios/")) {
          const link =
            payload.assistantMessage.match(
              /#\/panel\/scenarios\/[^\s]+/,
            )?.[0] || "";
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

        // 4) Send FINAL structured object as a JSON trailer
        // (your frontend can parse this off the end; or switch to SSE if you prefer)
        const trailer = JSON.stringify({
          status: "final",
          payload, // <-- exact structured data you wanted
          saved: { chatId, messageId: saved.id },
        });
        controller.enqueue(encoder.encode(`\n\n${trailer}`));
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });

  // Return the streaming response as you already do
  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
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
