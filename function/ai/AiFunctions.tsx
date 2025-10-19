import { prisma } from "@/prisma/prisma";
import { openai } from "@ai-sdk/openai";
import { generateText, Output, stepCountIs, tool } from "ai";
import { z } from "zod";
export async function GetRecommendedMessagesForMainChat(userId: string) {
  const mainChat = await prisma.chat.findFirst({
    where: {
      userId,
      isMain: true,
    },
    include: {
      Messages: true,
    },
  });

  if (!mainChat) return [];

  // Get the last 5 user messages from the main chat
  const LastMessages = mainChat.Messages.slice(-5);

  const res = await generateText({
    model: openai("gpt-4o-mini"),
    stopWhen: stepCountIs(3),
    prompt: `
    You are an AI assistant that helps users by providing relevant information based on their recent messages.
    Analyze the following user messages and generate a list of 3 recommended messages that the user might ask next and the messages should be from user's perspective.
    Provide the recommendations in a JSON array format.
    Make sure the messages should be in persian.
    you can use the getTasks tool to get the user's tasks and recommend them to the user.
    Last Messages: ${JSON.stringify(LastMessages)}
    Recommended Messages should be between 20 to 30 characters long.
    `,
    experimental_output: Output.object({
        schema: z.object({
            recommendations: z.array(z.string()).max(3).min(1)
        }),
    }),
    tools: {
      getTasks: tool({
        description: `Use this tool to get the user's tasks.`,
        inputSchema: z.object({
          question: z.string().describe("the users question"),
        }),
        execute: async ({}) => {
          const tasks = await prisma.userTask.findMany({
            where: { userId },
          });
          return tasks;
        },
      }),
    },
  });

  if (!res.experimental_output) {
    console.error("No experimental output from OpenAI");
    return [];
  }

  return res.experimental_output.recommendations;
}
