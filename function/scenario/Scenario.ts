import { Exam_GetUserResult } from "@/prisma/functions/Exam/ExamFun";
import { prisma } from "@/prisma/prisma";
import OpenAI from "openai";
// OpenAI Setup (v4 SDK)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function GetUserScenario({
  userId,
  examId,
  topic,
}: {
  userId: string;
  examId: string;
  topic: string;
}) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: {
      Questions: true,
    },
  });

  const userResult = await Exam_GetUserResult(examId, user?.id || "");
  console.log("User Result:", userResult);
  console.log("Exam Questions:", exam?.Questions);
  console.log("User:", user);

  if (!user || !exam || !userResult) {
    throw new Error("User, exam, or result not found");
  }

  const userAnswers = await prisma.userAnswer.findMany({
    where: {
      userId: userId,
      questionId: {
        in: exam.Questions.map((q) => q.id),
      },
    },
    include: {
      question: true,
    },
  });

  const formattedAnswers = userAnswers
    .map((ua, i) => {
      return `Q${i + 1}: ${ua.question.question} → Answer: ${ua.answer}`;
    })
    .join("\n");
  const systemPrompt = `You are an expert ${exam.name} exam AI.
You will receive a list of questions and answers from a user who took the exam and also you have the exam result. in the topic of ${topic} you need to generate a scenario for the user based on the exam result and answers. the scenario should have a name and a description.
Return the result in this JSON structure:
{
"name": "Task Name",
"description": "Task Description"
}
Respond only with valid JSON.
    `.trim();

  const userPrompt = `
User's Exam Answers:
${formattedAnswers}
User's Exam Result:
${userResult.result} → Description: ${userResult.description} → Details: ${userResult.details}
    `.trim();

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });
  const content = response.choices[0].message.content;
  // Parse JSON response safely
  const jsonMatch = content?.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No valid JSON in response");
  const resultObject = JSON.parse(jsonMatch[0]);
  if (!resultObject.name || !resultObject.description) {
    throw new Error("Invalid JSON structure in response");
  }
  // Save the scenario to the database
  const scenario = await prisma.scenario.create({
    data: {
      name: resultObject.name,
      description: resultObject.description,
      userId: userId,
      examId: examId,
    },
  });
  if (!scenario) {
    throw new Error("Failed to create scenario");
  }
  return scenario;
}

export type GetUserSenarioPrompt = Awaited<ReturnType<typeof GetUserScenario>>;

export async function GetUserSenarioTasks(
  userId: string,
  examId: string,
  scenarioId: string,
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: {
      Questions: true,
    },
  });

  const scenario = await prisma.scenario.findUnique({
    where: { id: scenarioId },
  });

  if (!user || !exam || !scenario) {
    throw new Error("User, exam, or scenario not found");
  }

  const userAnswers = await prisma.userAnswer.findMany({
    where: {
      userId: userId,
      questionId: {
        in: exam.Questions.map((q) => q.id),
      },
    },
    include: {
      question: true,
    },
  });

  const userTasks = await prisma.userTask.findMany({
    where: {
      userId: userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const formattedAnswers = userAnswers
    .map((ua, i) => {
      return `Q${i + 1}: ${ua.question.question} → Answer: ${ua.answer}`;
    })
    .join("\n");

  const systemPrompt = `You are an expert ${exam.name} exam AI.
You will receive a list of questions and answers from a user who took the exam and also you have the exam result. in the topic of ${
    scenario.name
  } and details for the scenario is ${JSON.stringify(
    scenario,
  )} you need to generate tasks for the user based on the exam result and answers.
Return the result in this JSON structure:
{
    "tasks": [
        {
        "title": "Task Title",
        "description": "Task Description",
        "dueDate": "YYYY-MM-DDTHH:mm:ssZ",
        "priority": "NORMAL" // e.g., "low", "normal", "high"
        "difficulty": Difficulty level of the task (1-5)
        }
    ]
}
generate tasks based on the user's exam answers and the scenario description and the user's existing tasks.\n
we need to reach the scenario's goal in the tasks and scenario approximate time that is ${scenario.approximateTime} days.
Answer in the same language as the questions and answers.
Respond only with valid JSON.
today's date is ${new Date().toISOString().split("T")[0]}.
You should generate tasks based on the user's exam answers and the scenario description. \n
write every thing in **Persian**.
    `.trim();

  const userTasksFormatted = userTasks
    .map((task, i) => {
      return `Task ${i + 1}: ${task.title} → Description: ${
        task.description || "No description"
      } → Due Date: ${
        task.dueDate ? task.dueDate.toISOString() : "No due date"
      } → Priority: ${task.priority} → status: ${
        task.status
      } → Delayed: ${task.isDelayed} → Updated: ${task.isUpdated}`;
    })
    .join("\n");

  const userTasksPrompt = `User's Existing Tasks:
${userTasksFormatted}
User's Exam Answers:
${formattedAnswers}
User's Exam Result:
${scenario.name} → Description: ${scenario.description} → Details: ${
    scenario.details || "No details"
  }
    `.trim();

  //   const userPrompt = `
  // User's Exam Answers:
  // ${formattedAnswers}
  // User's Exam Result:
  // ${scenario.name} → Description: ${scenario.description}
  //     `.trim();

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userTasksPrompt },
    ],
  });

  const content = response.choices[0].message.content;
  // Parse JSON response safely
  const jsonMatch = content?.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No valid JSON in response");
  const resultObject = JSON.parse(jsonMatch[0]);
  if (!resultObject.tasks || !Array.isArray(resultObject.tasks)) {
    throw new Error("Invalid JSON structure in response");
  }

  // Save the tasks to the database
  const tasks = await prisma.userTask.createMany({
    data: resultObject.tasks.map(
      (task: {
        title: string;
        description?: string;
        dueDate?: string | null;
        priority?: "LOW" | "NORMAL" | "HIGH";
        difficulty?: number;
      }) => ({
        userId: userId,
        title: task.title,
        description: task.description,
        dueDate: task.dueDate ? new Date(task.dueDate) : null,
        priority: task.priority || "NORMAL",
        scenarioId: scenarioId,
        isDelayed: false,
        isUpdated: false,
        difficulty: task.difficulty || 1, // Default to 1 if not provided
      }),
    ),
  });

  return tasks;
}

export type GetUserSenarioTasks = Awaited<
  ReturnType<typeof GetUserSenarioTasks>
>;
