// ai/scenario.ts
import { Exam_GetUserResult } from "@/prisma/functions/Exam/ExamFun";
import { prisma } from "@/prisma/prisma";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import z from "zod";

/* ------------------------- Schemas for structured output ------------------------- */

const ScenarioOutSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
});

const TaskItemSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  dueDate: z.string().datetime().optional().nullable(),   // ISO 8601
  startDate: z.string().datetime().optional().nullable(), // ISO 8601
  priority: z.enum(["LOW", "NORMAL", "HIGH"]).optional().default("NORMAL"),
  difficulty: z.number().int().min(1).max(5).optional().default(1),
});

const TaskListSchema = z.object({
  tasks: z.array(TaskItemSchema).min(1),
});

export async function GetUserScenario({
  userId,
  examId,
  topic,
}: {
  userId: string;
  examId: string;
  topic: string;
}) {
  const [user, exam] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.exam.findUnique({ where: { id: examId }, include: { Questions: true } }),
  ]);

  const userResult = await Exam_GetUserResult(examId, userId);

  if (!user || !exam || !userResult) {
    throw new Error("User, exam, or result not found");
  }

  const userAnswers = await prisma.userAnswer.findMany({
    where: { userId, questionId: { in: exam.Questions.map((q) => q.id) } },
    include: { question: true },
  });

  const formattedAnswers = userAnswers
    .map((ua, i) => `Q${i + 1}: ${ua.question.question} → Answer: ${ua.answer}`)
    .join("\n");

  const system = `You are an expert ${exam.name} exam AI.
You will receive a list of questions and answers from a user who took the exam and the user's exam result.
In the topic of "${topic}", generate a scenario for the user based on the exam result and answers.
Return ONLY valid JSON with this structure:
{
  "name": "Task Name",
  "description": "Task Description"
}
Write the text in Persian.`;

  const userPrompt = `
User's Exam Answers:
${formattedAnswers}

User's Exam Result:
${userResult.result} → Description: ${userResult.description} → Details: ${userResult.details}
`.trim();

  const { object } = await generateObject({
    model: openai("gpt-5.1"),
    system,
    prompt: userPrompt,
    schema: ScenarioOutSchema,
  });

  const scenario = await prisma.scenario.create({
    data: {
      name: object.name,
      description: object.description,
      userId,
      examId,
    },
  });

  return scenario;
}

export type GetUserSenarioPrompt = Awaited<ReturnType<typeof GetUserScenario>>;

export async function GetUserSenarioTasks(
  userId: string,
  examId: string,
  scenarioId: string,
) {
  const [user, exam, scenario] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.exam.findFirst({ where: { useForChat: true }, include: { Questions: true } }),
    prisma.scenario.findUnique({ where: { id: scenarioId } }),
  ]);

  if (!user || !exam || !scenario) {
    throw new Error("User, exam, or scenario not found");
  }

  const [userAnswers, userTasks] = await Promise.all([
    prisma.userAnswer.findMany({
      where: { userId, questionId: { in: exam.Questions.map((q) => q.id) } },
      include: { question: true },
    }),
    prisma.userTask.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const formattedAnswers = userAnswers
    .map((ua, i) => `Q${i + 1}: ${ua.question.question} → Answer: ${ua.answer}`)
    .join("\n");

  const userTasksFormatted = userTasks
    .map(
      (task, i) =>
        `Task ${i + 1}: ${task.title} → Description: ${
          task.description || "No description"
        } → Start Date: ${task.startDate.toISOString()}
→ Due Date: ${task.dueDate ? task.dueDate.toISOString() : "No due date"} → Priority: ${
          task.priority
        } → Status: ${task.status} → Delayed: ${task.isDelayed} → Updated: ${task.isUpdated}`,
    )
    .join("\n");

  const today = new Date().toISOString().split("T")[0];

  const system = `You are an expert ${exam.name} exam AI.
You will receive user's answers and scenario details and existing tasks.
Topic is "${scenario.name}", scenario details: ${JSON.stringify(scenario)}.
Generate tasks that reach the scenario goal in ~${scenario.approximateTime ?? "N/A"} days.
Use this JSON structure ONLY:
{
  "tasks": [
    {
      "title": "Task Title",
      "description": "Task Description",
      "dueDate": "YYYY-MM-DDTHH:mm:ssZ",
      "startDate": "YYYY-MM-DDTHH:mm:ssZ",
      "priority": "LOW | NORMAL | HIGH",
      "difficulty": 1-5
    }
  ]
}
Answer in **Persian**. Today's date is ${today}. Respond only with valid JSON.`;

  const prompt = `User's Existing Tasks:
${userTasksFormatted}

User's Exam Answers:
${formattedAnswers}

Scenario:
${scenario.name} → Description: ${scenario.description ?? "No description"} → Details: ${
    scenario.details ?? "No details"
  }`;

  const { object } = await generateObject({
    model: openai("gpt-5.1"),
    system,
    prompt,
    schema: TaskListSchema,
  });

  const created = await prisma.userTask.createMany({
    data: object.tasks.map((t) => ({
      userId,
      title: t.title,
      description: t.description,
      dueDate: t.dueDate ? new Date(t.dueDate) : new Date(),
      startDate: t.startDate ? new Date(t.startDate) : new Date(),
      priority: t.priority ?? "NORMAL",
      scenarioId,
      isDelayed: false,
      isUpdated: false,
      difficulty: t.difficulty ?? 1,
    })),
  });

  return created;
}

export type GetUserSenarioTasks = Awaited<ReturnType<typeof GetUserSenarioTasks>>;

export async function GenerateNewTask(
  userId: string,
  lastTaskId?: string,
  userInput?: string,
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const lastTask = lastTaskId
    ? await prisma.userTask.findUnique({
        where: { id: lastTaskId },
        include: {
          Scenario: {
            include: {
              exam: true,
              examResult: true,
              Tasks: true,
            },
          },
        },
      })
    : null;

  const exam = lastTask?.Scenario?.exam ?? null;
  const scenario = lastTask?.Scenario ?? null;
  const userResult = lastTask?.Scenario?.examResult ?? null;

  if (!user || !exam || !scenario || !lastTask) {
    throw new Error("User, exam, scenario, or last task not found");
  }

  const SingleTaskSchema = TaskItemSchema; // same structure for one task

  const system = `You are an expert ${exam.name} exam AI.
With scenario "${scenario.name}" (details: ${JSON.stringify(scenario)}), generate ONE new task 
based on the user's input and the last task. Return ONLY valid JSON with:
{
  "title": "Task Title",
  "description": "Task Description",
  "dueDate": "YYYY-MM-DDTHH:mm:ssZ",
  "startDate": "YYYY-MM-DDTHH:mm:ssZ",
  "priority": "LOW | NORMAL | HIGH",
  "difficulty": 1-5
}
Answer in **Persian**.`;

  const prompt = `User's Input:
${userInput ?? ""}

User's Last Task:
${JSON.stringify(lastTask)}

User's Exam Results:
${JSON.stringify(userResult)}
`;

  const { object } = await generateObject({
    model: openai("gpt-5.1"),
    system,
    prompt,
    schema: SingleTaskSchema,
  });

  return {
    title: object.title,
    description: object.description,
    dueDate: object.dueDate ? new Date(object.dueDate) : null,
    startDate: object.startDate ? new Date(object.startDate) : new Date(),
    priority: object.priority ?? "NORMAL",
    difficulty: object.difficulty ?? 1,
  };
}

export type GenerateNewTask = Awaited<ReturnType<typeof GenerateNewTask>>;
