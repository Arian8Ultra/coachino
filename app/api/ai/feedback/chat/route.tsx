import { IsAuthenticated } from "@/auth/AuthFunctions";
import { FeedbackType } from "@/generated/prisma";
import { prisma } from "@/prisma/prisma";
import { openai } from "@ai-sdk/openai";
import { generateText, stepCountIs, tool } from "ai";
import z from "zod";

export async function POST(request: Request) {
  const { type, message, url, messages } = await request.json();
  const user = await IsAuthenticated();

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const res = await generateText({
    model: openai("gpt-5.1"),
    prompt: `
    old messages: ${messages
      .map(
        (m: { role: string; message: string }) =>
          `Role: ${m.role}\nMessage: ${m.message}\n`,
      )
      .join("\n")}\n\n
    New User Feedback Type: ${type}\nUser Feedback Message: ${message}\nUser Feedback URL: ${url}\n\nPlease analyze the above user feedback and provide a concise summary along with any actionable insights or recommendations for improvement. Format the response in JSON with the following structure:\n{\n  "summary": "A brief summary of the feedback",\n  "insights": ["List of actionable insights or recommendations"]\n}`,
    messages: messages,
    stopWhen: stepCountIs(10),
    tools: {
      addFeedback: tool({
        name: "addFeedback",
        description: "Adds user feedback to the database",
        inputSchema: z.object({
          type: z.enum(FeedbackType),
          message: z.string(),
          url: z.string().optional(),
        }),
        execute: async ({
          type,
          message,
          url,
        }: {
          type: FeedbackType;
          message: string;
          url?: string;
        }) => {
          const feedback = await prisma.feedback.create({
            data: {
              userId: user.id,
              type: type,
              message: message,
              url,
            },
          });
          return feedback;
        },
      }),
    },
  });

  return new Response(JSON.stringify(res), { status: 201 });
}
