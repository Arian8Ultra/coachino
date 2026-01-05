import { GetUserData, UserDataSchema } from "@/lib/rag";
import { computeAndSaveUserExamResult } from "@/lib/score-exam";
import {
  Notification_Create,
  Notification_Delete,
  Notification_GetAll,
} from "@/prisma/functions/Notification/NotificationFun";
import { prisma } from "@/prisma/prisma";
import { openai } from "@ai-sdk/openai";
import { generateObject, tool } from "ai";
import z from "zod";

const SubmitPayloadSchema = z.object({
  examId: z.string(),
  durationMs: z.number().int().nonnegative().optional(),
  examVersion: z.string().optional(),
});

function newBuildTools(userId: string) {
  return {
    getTasks: tool({
      description: `Use this tool to get the user's tasks.`,
      inputSchema: z.object({
        question: z.string().describe("the users question"),
      }),
      execute: async ({}) => {
        const tasks = await prisma.userTask.findMany({ where: { userId } });
        return tasks;
      },
    }),
    getExamResults: tool({
      description: `Use this tool to get the user's exam results.if the user doesnt have any exam results start the exam for him.`,
      inputSchema: z.object({
        question: z.string().describe("the users question"),
      }),
      execute: async ({}) => {
        const results = await prisma.userExamResult.findMany({
          where: { userId },
        });
        return results;
      },
    }),
    getUserSenarios: tool({
      description: `Use this tool to get the user's scenarios.`,
      inputSchema: z.object({
        question: z.string().describe("the users question"),
      }),
      execute: async ({}) => {
        const scenarios = await prisma.scenario.findMany({
          where: { userId },
          include: { Tasks: true },
        });
        return scenarios;
      },
    }),
    getScenarioLink: tool({
      description: `Use this tool to get the link to a specific scenario. 
        The link should be in the format /panel/scenarios/{scenarioId}.
        Use this tool when the user asks for a specific scenario by name or id.
        If you don't know the scenario id, use getUserScenarios first.
        Make the link like this [scenario name](/panel/scenarios/{scenarioId}) and make the link bold with a different color.`,
      inputSchema: z.object({
        scenarioId: z.string().describe("the scenario id"),
      }),
      execute: async ({ scenarioId }) => {
        const scenario = await prisma.scenario.findFirst({
          where: { id: scenarioId, userId },
          select: { id: true, name: true },
        });
        if (!scenario) return "No scenario found";
        return `/panel/scenarios/${scenario.id}`;
      },
    }),
    getUserData: tool({
      description: `Use this tool to get the user's data, including exam results and tasks and personal info. 
        Use this tool to answer questions about performance, strengths, weaknesses, next steps, and personal information like name.`,
      inputSchema: z.object({
        question: z.string().describe("the users question"),
      }),
      execute: async ({}) => {
        const data = await GetUserData(userId);
        const parsed = UserDataSchema.parse(data);
        return parsed;
      },
    }),
    getUserProfile: tool({
      description: `Use this tool to get the user's personal dynamic profile information like name, career level, goals, and ...`,
      inputSchema: z.object({
        question: z.string().describe("the users question"),
      }),
      execute: async ({}) => {
        const data = await prisma.userProfile.findUnique({
          where: { userId },
          include: { params: true },
        });
        if (!data) return "No user profile found";
        return data;
      },
    }),
    updateUserProfile: tool({
      description: `Use this tool to update the user's personal dynamic profile information like name, career level, goals, and ...\n\n add everything(every information about him/her self) that the user says to his profile as a key value pair.`,
      inputSchema: z.object({
        key: z.string().describe("the profile key to update or add"),
        value: z.string().describe("the profile value to set"),
      }),
      execute: async ({ key, value }) => {
        const userProfile = await prisma.userProfile.findUnique({
          where: { userId },
          include: { params: true },
        });
        if (!userProfile) {
          // create new profile
          const newProfile = await prisma.userProfile.create({
            data: {
              userId,
              params: { create: { key, value } },
            },
            include: { params: true },
          });
          return newProfile;
        } else {
          // update or create param
          const existingParam = userProfile.params.find((p) => p.key === key);
          if (existingParam) {
            // update existing param
            const updated = await prisma.userProfile.update({
              where: { userId },
              data: {
                params: {
                  update: {
                    where: { id: existingParam.id },
                    data: {
                      value,
                    },
                  },
                },
              },
            });
            return updated;
          } else {
            // create new param
            const created = await prisma.userProfile.create({
              data: {
                userId,
                params: {
                  create: { key, value },
                },
              },
            });
            return created;
          }
        }
      },
    }),
    addMultipleUserProfileParams: tool({
      description: `Use this tool to add multiple key value pairs to the user's profile at once. each key value pair should be added as a separate param.`,
      inputSchema: z.object({
        params: z
          .array(
            z.object({
              key: z.string().describe("the profile key to update or add"),
              value: z.string().describe("the profile value to set"),
            }),
          )
          .describe("An array of key-value pairs to update or add"),
      }),
      execute: async ({ params }) => {
        const userProfile = await prisma.userProfile.findUnique({
          where: { userId },
          include: { params: true },
        });
        if (!userProfile) {
          // create new profile
          const newProfile = await prisma.userProfile.create({
            data: {
              userId,
              params: {
                create: params.map((p) => ({ key: p.key, value: p.value })),
              },
            },
            include: { params: true },
          });
          return newProfile;
        } else {
          // add new params
          const created = await prisma.userProfile.update({
            where: { userId },
            data: {
              params: {
                create: params.map((p) => ({ key: p.key, value: p.value })),
              },
            },
            include: { params: true },
          });
          return created;
        }
      },
    }),
    getUserInfo: tool({
      description: `Use this tool to get the user's personal information like name and ...`,
      inputSchema: z.object({
        question: z.string().describe("the users question"),
      }),
      execute: async ({}) => {
        const data = await prisma.user.findUnique({
          where: { id: userId },
          select: { name: true, id: true, email: true },
        });
        if (!data) return "No user data found";
        return data;
      },
    }),
    generateExamLink: tool({
      description:
        "generate a link to start or continue the exam for the user. The link should be in the format: `/panel/exams/${examId}` the user can see the exam results and start or continue the exam from this link.",
      inputSchema: z.object({
        examId: z.string().describe("The exam ID"),
      }),
      execute: async ({ examId }) => {
        return {
          link: `/panel/exams/${examId}`,
        };
      },
    }),
    getNotAnsweredQuestions: tool({
      description:
        "Get the list of question ids that the user has not answered yet for a specific exam. use the exam id of cmh63dky30000v16ku340i0hb if you dont have any examId. just return the ids one by one in the metaData with the type of the message set as 'question'.\n if the user answered all questions then return an empty array and use 'submitExamAnswers' tool to submit the answers and get the exam result and give the user the results.",
      inputSchema: z.object({
        examId: z.string().optional().describe("The exam id"),
      }),
      execute: async ({ examId }) => {
        const exam = await prisma.exam.findUnique({
          where: { id: examId || "cmh63dky30000v16ku340i0hb" },
          include: { Questions: { select: { id: true } } },
        });
        if (!exam) return { error: "Exam not found" };
        const answeredQuestions = await prisma.userAnswer.findMany({
          where: {
            questionId: { in: exam.Questions.map((q) => q.id) },
            userId,
          },
          select: { questionId: true },
        });
        const answeredQuestionIds = new Set(
          answeredQuestions.map((a) => a.questionId),
        );
        const notAnswered = exam.Questions.filter(
          (q) => !answeredQuestionIds.has(q.id),
        ).map((q) => q.id);
        return { notAnsweredQuestionIds: notAnswered };
      },
    }),
    submitExamAnswers: tool({
      description:
        "Make sure user answered all questions before submitting with using checkIfUserAnsweredAllQuestions. Submit and compute and save the scored result. use the exam id of cmh63dky30000v16ku340i0hb if you dont have any examId. get the id of the question from the getExamQuestionsById tool make sure the ids are correct",
      inputSchema: SubmitPayloadSchema,
      execute: async ({ examId, durationMs, examVersion }) => {
        // Load the exam & allowed question ids
        const exam = await prisma.exam.findUnique({
          where: { id: examId || "cmh63dky30000v16ku340i0hb" },
          include: { Questions: { select: { id: true } } },
        });
        const totalQuestions = exam?.Questions.length || 0;
        const answeredCount = await prisma.userAnswer.count({
          where: {
            questionId: { in: exam?.Questions.map((q) => q.id) },
            userId,
          },
        });

        if (!exam) return { error: "Exam not found" };
        if (answeredCount < totalQuestions) {
          return {
            error: `User has not answered all questions. Answered ${answeredCount} out of ${totalQuestions} `,
          };
        }

        // Compute + persist result using your existing scorer
        const saved = await computeAndSaveUserExamResult({
          examId,
          userId,
          durationMs,
          examVersion,
        });

        return { ok: true, resultId: saved.id };
      },
    }),
    getQuestionDetailsById: tool({
      description: "Get the full question details by question id.",
      inputSchema: z.object({
        questionId: z.string().describe("The question id"),
      }),
      execute: async ({ questionId }) => {
        const question = await prisma.question.findUnique({
          where: { id: questionId },
          include: {
            QuestionKey: true,
            scale: true,
          },
        });
        if (!question) return "No question found";
        return question;
      },
    }),
    generateRecommendedScenarios: tool({
      description:
        "Generate recommended scenarios for the user based on their exam results and performance. set the message type to 'scenario_recommendation' and give the recommended scenarios in the metaData object.",
      inputSchema: z.object({
        topics: z.array(z.string()).optional().describe("Topics to focus on"),
      }),
      execute: async ({ topics }) => {
        const examResults = await prisma.userExamResult.findMany({
          where: { userId },
          select: { id: true },
        });
        const res = await generateObject({
          model: openai("gpt-5.1"),
          schema: z.object({
            scenarios: z.array(
              z.object({
                name: z.string().describe("یک عنوان کوتاه"),
                description: z.string().describe("یک خلاصه کوتاه"),
                details: z.string().describe("راهنمای کامل"),
                approximateTime: z
                  .number()
                  .int()
                  .describe("مدت زمان تقریبی به روز"),
                best: z
                  .boolean()
                  .describe(
                    "یک فلگ بولی (true برای بهترین سناریو، false برای بقیه)",
                  ),
              }),
            ),
          }),
          providerOptions: {
            openai: {
              temperature: 0.7,
              reasoningEffort: "medium",
            },
          },
          messages: [
            {
              role: "user",
              content: `Generate 2 recommended scenarios for user ${userId} based on their exam results ${JSON.stringify(
                examResults,
              )} results. Focus on topics: ${topics?.join(", ")}`,
            },
            {
              role: "system",
              content:
                "Provide scenarios that help the user improve their skills based on their exam performance. Each scenario should have a name, description, detailed guide, and approximate time in days. Mark one scenario as the best option.\n\n respond only in persian.",
            },
          ],
        });
        console.log("generateRecommendedScenarios", res.object);
        const examResult = await prisma.userExamResult.findFirst({
          where: { userId },
          select: { id: true },
        });

        const examResultId = examResult?.id || "";
        const chat = await prisma.chat.findFirst({
          where: { userId, isMain: true },
          select: { id: true },
        });
        try {
          const created = [];
          for (const obj of res.object.scenarios) {
            const rec = await prisma.recommendedScenario.create({
              data: {
                name: obj.name,
                description: obj.description,
                details: obj.details,
                approximateTime: obj.approximateTime,
                userId,
                examResultId,
                chosenByCoachino: obj.best === true,
                chatId: chat?.id || "",
              },
            });
            created.push(rec);
          }
          return created;
        } catch (e) {
          console.error("Error creating recommended scenarios:", e);
          return "Error creating recommended scenarios";
        }
      },
    }),
    getRecommendedScenarios: tool({
      description:
        "Get the recommended scenarios for the user based on their exam results and performance.",
      inputSchema: z.object({
        examId: z.string().describe("The exam ID"),
      }),
      execute: async ({ examId }) => {
        const examResult = await prisma.userExamResult.findFirst({
          where: { examId, userId },
          select: { id: true },
        });
        if (!examResult) return "No exam result found";
        const scenarios = await prisma.recommendedScenario.findMany({
          where: { examResultId: examResult.id, userId },
        });
        return scenarios;
      },
    }),
    saveAScenarioForUser: tool({
      description:
        "Save a new scenario for the user based on the provided details.",
      inputSchema: z.object({
        name: z.string().describe("The scenario name"),
        description: z.string().describe("The scenario description"),
        details: z.string().describe("The scenario details"),
        approximateTime: z
          .number()
          .min(0)
          .describe("The approximate time in days"),
      }),
      execute: async ({ name, description, details, approximateTime }) => {
        const scenario = await prisma.recommendedScenario.create({
          data: {
            name,
            description,
            details,
            approximateTime,
            userId,
          },
        });
        return scenario;
      },
    }),
    addATaskToScenario: tool({
      description: "Add a new task to an existing scenario for the user.",
      inputSchema: z.object({
        scenarioId: z.string().describe("The scenario ID"),
        task: z.object({
          title: z.string().min(1),
          description: z.string().min(1),
          dueDate: z.string().describe("The due date in ISO 8601 format"),
          startDate: z.string().describe("The start date in ISO 8601 format"),
          priority: z
            .enum(["LOW", "NORMAL", "HIGH"])
            .optional()
            .default("NORMAL"),
          difficulty: z.number().int().min(1).max(5).optional().default(1),
        }),
      }),
      execute: async ({ scenarioId, task }) => {
        const scenario = await prisma.recommendedScenario.findFirst({
          where: { id: scenarioId, userId },
        });
        if (!scenario) return "No scenario found";
        const createdTask = await prisma.userTask.create({
          data: {
            ...task,
            userId,
          },
        });
        return createdTask;
      },
    }),
    updateTask: tool({
      description: "Update an existing task for the user.",
      inputSchema: z.object({
        taskId: z.string().describe("The task ID"),
        updates: z.object({
          title: z.string().min(1).optional(),
          description: z.string().min(1).optional(),
          dueDate: z
            .string()
            .optional()
            .describe("The due date in ISO 8601 format"),
          startDate: z
            .string()
            .optional()
            .describe("The start date in ISO 8601 format"),
          priority: z.enum(["LOW", "NORMAL", "HIGH"]).optional(),
          difficulty: z.number().int().min(1).max(5).optional(),
        }),
      }),
      execute: async ({ taskId, updates }) => {
        const task = await prisma.userTask.findFirst({
          where: { id: taskId, userId },
        });
        if (!task) return "No task found";
        const updatedTask = await prisma.userTask.update({
          where: { id: taskId },
          data: {
            ...updates,
          },
        });
        return updatedTask;
      },
    }),
    updateWholeScenarioTasks: tool({
      description:
        "Update all tasks of a scenario for the user. This will replace existing tasks with the provided list. To delete tasks, provide their IDs in the deletedIds array.",
      inputSchema: z.object({
        scenarioId: z.string().describe("The scenario ID"),
        tasks: z.array(
          z.object({
            title: z.string().min(1),
            description: z.string().min(1),
            dueDate: z.string().describe("The due date in ISO 8601 format"),
            startDate: z.string().describe("The start date in ISO 8601 format"),
            priority: z
              .enum(["LOW", "NORMAL", "HIGH"])
              .optional()
              .default("NORMAL"),
            difficulty: z.number().int().min(1).max(5).optional().default(1),
          }),
        ),
        deletedIds: z
          .array(z.string())
          .optional()
          .describe("IDs of tasks to delete"),
      }),
      execute: async ({ scenarioId, tasks, deletedIds }) => {
        const scenario = await prisma.scenario.findFirst({
          where: { id: scenarioId, userId },
        });
        if (!scenario) return "No scenario found";
        // Delete existing tasks for the scenario
        await prisma.userTask.deleteMany({
          where: { id: { in: deletedIds || [] }, userId },
        });
        const createdTasks = [];
        for (const task of tasks) {
          const created = await prisma.userTask.create({
            data: {
              ...task,
              userId,
            },
          });
          createdTasks.push(created);
        }
        return createdTasks;
      },
    }),
    markTaskAsCompleted: tool({
      description: "Mark a task as completed for the user.",
      inputSchema: z.object({
        taskId: z.string().describe("The task ID"),
      }),
      execute: async ({ taskId }) => {
        const task = await prisma.userTask.findFirst({
          where: { id: taskId, userId },
        });
        if (!task) return "No task found";
        const updatedTask = await prisma.userTask.update({
          where: { id: taskId },
          data: {
            status: "COMPLETED",
          },
        });
        return updatedTask;
      },
    }),
    addMultipleTasksForUser: tool({
      description: "Add multiple tasks for the user.",
      inputSchema: z.object({
        tasks: z.array(
          z.object({
            title: z.string().min(1),
            description: z.string().min(1),
            dueDate: z.string().describe("The due date in ISO 8601 format"),
            startDate: z.string().describe("The start date in ISO 8601 format"),
            priority: z
              .enum(["LOW", "NORMAL", "HIGH"])
              .optional()
              .default("NORMAL"),
            difficulty: z.number().int().min(1).max(5).optional().default(1),
          }),
        ),
      }),
      execute: async ({ tasks }) => {
        const createdTasks = [];
        for (const task of tasks) {
          const created = await prisma.userTask.create({
            data: {
              ...task,
              userId,
            },
          });
          createdTasks.push(created);
        }
        return createdTasks;
      },
    }),
    checkIfUserAnsweredAllQuestions: tool({
      description:
        "Check if the user has answered all questions in a specific exam. get the id of the question from the getExamQuestionsById tool make sure the ids are correct",
      inputSchema: z.object({
        examId: z.string().optional().describe("The exam id"),
      }),
      execute: async () => {
        const exam = await prisma.exam.findFirst({
          where: { useForChat: true },
          include: { Questions: { select: { id: true } } },
        });
        if (!exam) return { error: "Exam not found" };
        const totalQuestions = exam.Questions.length;
        const answeredCount = await prisma.userAnswer.count({
          where: {
            questionId: { in: exam.Questions.map((q) => q.id) },
            userId,
          },
        });
        return {
          totalQuestions,
          answeredCount,
          allAnswered: totalQuestions === answeredCount,
        };
      },
    }),
    generateTasksForScenario: tool({
      description:
        "Generate tasks for a given scenario to help the user achieve the scenario goals.",
      inputSchema: z.object({
        scenarioId: z.string().describe("The scenario ID"),
      }),
      execute: async ({ scenarioId }) => {
        const scenario = await prisma.recommendedScenario.findFirst({
          where: { id: scenarioId, userId },
        });
        const userTasks = await prisma.userTask.findMany({ where: { userId } });
        const userExamResults = await prisma.userExamResult.findMany({
          where: { userId },
        });
        const userData = await GetUserData(userId);
        const userProfile = await prisma.userProfile.findUnique({
          where: { userId },
          include: { params: true },
        });
        if (!scenario) return "No scenario found";
        const TaskItemSchema = z.object({
          title: z.string().min(1),
          description: z.string().min(1),
          dueDate: z.date(), // ISO 8601
          startDate: z.date(), // ISO 8601
          priority: z
            .enum(["LOW", "NORMAL", "HIGH"])
            .optional()
            .default("NORMAL"),
          difficulty: z.number().int().min(1).max(5).optional().default(1),
        });
        const res = await generateObject({
          model: openai("gpt-5.1"),
          schema: z.object({
            tasks: z.array(TaskItemSchema).min(1).max(10),
          }),
          messages: [
            {
              role: "system",
              content: `You are a helpful assistant. Generate tasks for the following scenario: ${
                scenario.name
              } - ${
                scenario.description
              }. Provide clear and actionable tasks to help the user achieve the scenario goals. Consider the user's existing tasks: ${JSON.stringify(
                userTasks,
              )}, exam results: ${JSON.stringify(
                userExamResults,
              )}, user data: ${JSON.stringify(
                userData,
              )}, user profile: ${JSON.stringify(userProfile)}.
              **respond only in persian.**`,
            },
          ],
        });
        const createdTasks = [];
        for (const task of res.object.tasks) {
          const created = await prisma.userTask.create({
            data: {
              title: task.title,
              description: task.description,
              dueDate: task.dueDate,
              startDate: task.startDate,
              priority: task.priority,
              difficulty: task.difficulty,
              userId,
            },
          });
          createdTasks.push(created);
        }
        return createdTasks;
      },
    }),
    addNotificationToUser: tool({
      description: `Add a notification message for the user. the date of now is ${new Date().toISOString()}, dont add duplicate notifications with the same title and message within 1 hour. check existing notifications before adding a new one using getUserNotifications tool.`,
      inputSchema: z.object({
        message: z.string().describe("The notification message"),
        title: z.string().describe("The notification title"),
        dueDate: z.string().describe("The due date in ISO 8601 format"),
        hasReminder: z.boolean().optional().default(false),
      }),
      execute: async ({ message, title, dueDate, hasReminder }) => {
        const notification = await Notification_Create(
          {
            title,
            message,
            dueDate: dueDate ? new Date(dueDate) : undefined,
            hasReminder,
          },
          userId,
        );
        return notification;
      },
    }),
    getUserNotifications: tool({
      description: `Get all notifications for the user.`,
      inputSchema: z.object({}),
      execute: async () => {
        const notifications = await Notification_GetAll(userId);
        return notifications;
      },
    }),
    deleteUserNotification: tool({
      description: `Delete a notification by its ID.`,
      inputSchema: z.object({
        id: z.string().describe("The ID of the notification to delete"),
      }),
      execute: async ({ id }) => {
        const deleted = await Notification_Delete(id, userId);
        return deleted;
      },
    }),
    deleteUserTask: tool({
      description: `Delete a user task by its ID.`,
      inputSchema: z.object({
        id: z.string().describe("The ID of the user task to delete"),
      }),
      execute: async ({ id }) => {
        const deleted = await prisma.userTask.deleteMany({
          where: { id, userId },
        });
        return deleted;
      },
    }),
    deleteManyUserTasks: tool({
      description: `Delete multiple user tasks by their IDs.`,
      inputSchema: z.object({
        ids: z
          .array(z.string())
          .describe("The IDs of the user tasks to delete"),
      }),
      execute: async ({ ids }) => {
        const deleted = await prisma.userTask.deleteMany({
          where: { id: { in: ids }, userId },
        });
        return deleted;
      },
    }),
    web_search: openai.tools.webSearch({
      searchContextSize: "high",

      // filters
    }),
    userDoesNotHaveWebSearchAccess: tool({
      description:
        "Indicates that the user does not have access to the web search feature.",
      inputSchema: z.object({}),
      execute: async () => {
        return {
          error:
            "User does not have access to web search feature. Please upgrade subscription. push the user to buy a subscription. that is very important.and set the message type to 'subscription_prompt'",
        };
      },
    }),
  };
}

export { newBuildTools };
