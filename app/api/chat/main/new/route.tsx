//app/api/chat/main
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
  generateText,
  ModelMessage,
  Output,
  stepCountIs,
  streamText,
  UserModelMessage,
} from "ai";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

const GAURD = `
1. You are Coachino's AI assistant, designed to help users improve themselves through personalized coaching.\n
2. Always prioritize user privacy and data security\n
3. dont generate any id on your own for question ids or scenario ids use the tools provided to you to get question ids and scenario ids\n
4. if the user has not any exam result start the exam for the user automaticly by calling the getNotAnsweredQuestions tool and just return the quesiton id in the meta and set the type of the message as 'question' if the user didnt take an exam use the getNotAnsweredQuestions tool to get the question ids if the user asked for anything else dont answer it and just start the exam for the user and say من برای پاسخ به سوالاتت نیاز دارم بشنامت پس بیا با هم یک آزمون کوتاه بدیم. شروع کنیم؟\n
5. if user provides any personal information like name age etc store them in the user profile using the updateUserProfile tool\n
6. dont generate scenario recommendation on your own use the tool named generateRecommendedScenarios to get recommended scenarios for the user and just return the scenarios in the meta data and set the type of the message as 'scenario_recommendation'\n
7. just use 'scenario_recommendation' as type when you are returning recommended scenarios for the user.
8. user the 'question' type when you are returning a valid question id for the user to answer.\n
9. always answer in persian language.\n\n\n
`;

const getQuestions = async () => {
  "use cache";
  const exam = await prisma.exam.findFirst({
    where: { useForChat: true },
  });
  if (exam) {
    const questions = await prisma.question.findMany({
      where: { examId: exam.id },
    });
    return questions;
  }
};
export async function POST(req: NextRequest) {
  const {
    messages,
  }: {
    messages: {
      role: "user" | "assistant" | "system";
      content: string;
      metaData?: {
        questionId: string;
      };
    }[];
  } = await req.json();

  // console.log("Received messages:", messages);

  // 1. Auth
  const user = await IsAuthenticated();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const userId = user.id;
  if (!userId) {
    return NextResponse.json({ error: "Invalid user" }, { status: 401 });
  }
  if (!(await checkUserMonthlyLimit(user))) {
    return NextResponse.json(
      { error: "Monthly limit reached. Please upgrade your plan." },
      { status: 403 },
    );
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
        lastMessage.content === userMsgs[userMsgs.length - 1].content
      ) {
        // console.log("Duplicate user message, skipping OpenAI call");
      } else {
        const encodedContent = encodeMessage(
          userMsgs[userMsgs.length - 1].content,
          userId,
        );
        await prisma.message.create({
          data: { ...userMsgs[userMsgs.length - 1], content: encodedContent },
        });
      }
    } else {
      const encodedContent = encodeMessage(
        userMsgs[userMsgs.length - 1].content,
        userId,
      );
      await prisma.message.create({
        data: { ...userMsgs[userMsgs.length - 1], content: encodedContent },
      });
    }
  }

  const last10Messages = messages.slice(-10);
  const userExamResults = await prisma.userExamResult.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  // console.log("Last 10 messages:", last10Messages);

  // 3. Call OpenAI
  const res = generateText({
    model: userExamResults.length > 0 ? openai("gpt-5") : openai("gpt-5-mini"),
    messages: [
      ...last10Messages.map((m) =>
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
    maxOutputTokens: 1500,
    // system: `You are a helpful assistant. Check your knowledge base before answering any questions.
    // if you need to get any information about the user use the tools below.
    // and also answer everything in persian if the answer has any other language translate it to persian.
    // if the user has not any exam result start the exam for the user automaticly by calling the getNotAnsweredQuestions tool and just return the quesiton id in the meta and set the type of the message as 'question' if the user didnt take an exam use the getNotAnsweredQuestions tool to get the question ids if the user asked for anything else dont answer it and just start the exam for the user and say من برای پاسخ به سوالاتت نیاز دارم بشنامت پس بیا با هم یک آزمون کوتاه بدیم. شروع کنیم؟, if you want ot ask any question just give back the id of that question and nothing esle.dont generate scenario recommendation on your own use the tool named generateRecommendedScenarios to get recommended scenarios for the user and just return the scenarios in the meta data and set the type of the message as 'scenario_recommendation'\n\n just use 'scenario_recommendation' as type when you are returning recommended scenarios for the user.`,
    system: GAURD,
    providerOptions: {
      openai: {
        reasoningEffort: userExamResults.length > 0 ? "medium" : "minimal",
        user: userId,
      },
    },
    tools: newBuildTools(userId),
    experimental_telemetry: {
      isEnabled: true,
    },
    experimental_output: Output.object({
      schema: z.object({
        expectedAnswers: z
          .array(z.string())
          .nullable()
          .describe(
            "The expected answers like the options for the question in an array form like this ['option1','option2','option3']",
          ),
        expectedAnswerType: z
          .enum(["text", "number", "boolean"])
          .nullable()
          .or(z.string())
          .describe("The expected answer type"),
        assistantMessage: z.string(),
        type: z
          .enum(["text", "link", "question", "scenario_recommendation"])
          .or(z.string())
          .describe(
            "The type of the message, if the message is a question use 'question' and set the questionId in the metaData object, if the message is a scenario recommendation use 'scenario_recommendation' and set the scenarios in the metaData object",
          ),
        metaData: z
          .object({
            questionId: z
              .string()
              .describe("The question id is a uuid")
              .optional(),
            scenarios: z
              .array(
                z.object({
                  name: z.string(),
                  id: z.string(),
                  userId: z.string(),
                  description: z.string().nullable(),
                  details: z.string().nullable(),
                  chatId: z.string().nullable(),
                  approximateTime: z.number().nullable(),
                  examResultId: z.string().nullable(),
                  chosenByCoachino: z.boolean(),
                  chosenByUser: z.boolean(),
                }),
              )
              .describe(
                "The recommended scenarios for the user that you generated with the tool named generateRecommendedScenarios",
              )
              .optional(),
          })
          .describe("The metadata related to this question"),
      }),
    }),
  });
  console.log("OpenAI response:", JSON.stringify(res));
  const questions = await getQuestions();

  let assistant = (await res).experimental_output?.assistantMessage || "سوال";

  // console.log("Assistant response:", assistant);

  if (!assistant || assistant.trim().length === 0) {
    return NextResponse.json(
      { error: "No response from assistant" },
      { status: 500 },
    );
  }

  const encodedAssistantMessage = encodeMessage(assistant, userId);
  const questionId =
    (await res).experimental_output?.metaData?.questionId || null;
  // 4. Persist assistant reply
  await prisma.message.create({
    data: {
      chatId,
      userId,
      role: "assistant",
      content: encodedAssistantMessage || "",
      expectedAnswers: (await res).experimental_output?.expectedAnswers || [],
      expectedAnswerType: (await res).experimental_output?.expectedAnswerType,
      type:
        (await res).experimental_output?.metaData?.questionId &&
        questions?.find((q) => q.id === questionId)
          ? "question"
          : (
              await res
            ).experimental_output?.metaData?.scenarios?.length ?? 0 > 0
          ? "scenario_recommendation"
          : "text", // Assuming this is a text message
      url: assistant?.includes("http")
        ? assistant.match(/https?:\/\/[^\s]+/)?.[0] || null
        : null, // Extract URL if present
      metaData: (await res).experimental_output?.metaData,
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
        expectedAnswers: (await res).experimental_output?.expectedAnswers,
        expectedAnswerType: (await res).experimental_output?.expectedAnswerType,
        type:
          (await res).experimental_output?.metaData?.questionId &&
          questions?.find((q) => q.id === questionId)
            ? "question"
            : (await res).experimental_output?.metaData?.scenarios?.length ?? 0 > 0
            ? "scenario_recommendation"
            : "text",
        metaData: (await res).experimental_output?.metaData,
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
