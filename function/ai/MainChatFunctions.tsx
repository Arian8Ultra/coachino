import { GetUserData, UserDataSchema } from "@/lib/rag";
import { computeAndSaveUserExamResult } from "@/lib/score-exam";
import { prisma } from "@/prisma/prisma";
import { tool } from "ai";
import z from "zod";
const AnswerSchema = z.object({
  questionId: z.string(),
  // Keep your client serialization:
  // SINGLE_CHOICE: "2" | MULTIPLE_CHOICE: "[0,2]" | TEXT/DATE: "..."
  answer: z.string(),
});

const SubmitPayloadSchema = z.object({
  examId: z.string(),
  userAnswers: z.array(AnswerSchema).min(1, "No answers provided"),
  durationMs: z.number().int().nonnegative().optional(),
  examVersion: z.string().optional(),
});

function buildTools(userId: string) {
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
    getExamQuestionsById: tool({
      description:
        "Fetch an exam by id with its questions for rendering to the user.if we dont have the id of the exam we can get it from getExamList tool, provide every detail you have about the question like anchors and everything. and also write the question like a question with the anchors and everything below the question you can use markdown format.",
      inputSchema: z.object({
        examId: z.string().optional().describe("The exam id"),
        examName: z.string().optional().describe("The exam name"),
      }),
      execute: async ({ examId, examName }) => {
        let exam;
        if (examId) {
          exam = await prisma.exam.findUnique({
            where: { id: examId },
            include: {
              Questions: {
                select: {
                  id: true,
                  code: true,
                  question: true,
                  options: true, // string[]
                  type: true, // QuestionType
                  isMandatory: true,
                  meta: true,
                  anchorA: true,
                  anchorB: true,
                },
              },
              Dimension: {
                select: { id: true, code: true, name: true },
              },
            },
          });
        } else if (examName) {
          exam = await prisma.exam.findFirst({
            where: { name: examName },
            include: {
              Questions: {
                select: {
                  id: true,
                  code: true,
                  question: true,
                  options: true, // string[]
                  type: true, // QuestionType
                  isMandatory: true,
                  meta: true,
                  anchorA: true,
                  anchorB: true,
                },
              },
              Dimension: {
                select: { id: true, code: true, name: true },
              },
            },
          });
        } else {
          return { error: "Exam id or name must be provided" };
        }
        if (!exam) return { error: "Exam not found" };

        // Normalize questions (stable structure for UI/agent)
        const questions = exam.Questions.map((q) => ({
          questionId: q.id,
          code: q.code ?? null,
          question: q.question,
          options: q.options ?? [],
          type: q.type, // "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "TEXT" | "DATE" | "FiveOption"
          isMandatory: q.isMandatory,
          meta: q.meta ?? null,
          anchorA: q.anchorA ?? null,
          anchorB: q.anchorB ?? null,
        }));

        return {
          id: exam.id,
          name: exam.name,
          description: exam.description,
          dimensions: exam.Dimension,
          questions,
        };
      },
    }),

    /** Submit answers for an exam (deletes prior answers for that exam’s questions, saves new, then computes result) */
    submitExamAnswers: tool({
      description:
        "Submit user's answers for an exam, then compute and save the scored result.",
      inputSchema: SubmitPayloadSchema,
      execute: async ({ examId, userAnswers, durationMs, examVersion }) => {
        // Load the exam & allowed question ids
        const exam = await prisma.exam.findUnique({
          where: { id: examId },
          include: { Questions: { select: { id: true } } },
        });
        if (!exam) return { error: "Exam not found" };

        const allowed = new Set(exam.Questions.map((q) => q.id));

        // Keep same serialization routine your API uses
        const rows = userAnswers
          .filter((a) => a && allowed.has(a.questionId))
          .map((a) => ({
            userId,
            questionId: a.questionId,
            answer:
              typeof a.answer === "string"
                ? a.answer
                : JSON.stringify(a.answer),
          }));

        // Replace prior answers for this exam for this user, then insert new ones
        await prisma.$transaction([
          prisma.userAnswer.deleteMany({
            where: { userId, questionId: { in: Array.from(allowed) } },
          }),
          rows.length
            ? prisma.userAnswer.createMany({ data: rows })
            : prisma.$executeRaw`SELECT 1`,
        ]);

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
    getExamList: tool({
      description:
        "List available exams. Optionally includes per-exam user progress (answered count). Accepts optional search and limit.",
      inputSchema: z.object({
        search: z
          .string()
          .trim()
          .optional()
          .describe("Filter by exam name (contains)."),
        limit: z.number().int().positive().max(100).optional(),
        includeProgress: z.boolean().optional().default(true),
      }),
      execute: async ({ search, limit, includeProgress }) => {
        // 1) Fetch exams with minimal aggregates in one query
        const exams = await prisma.exam.findMany({
          where: search
            ? { name: { contains: search, mode: "insensitive" } }
            : undefined,
          orderBy: { createdAt: "desc" },
          take: limit ?? undefined,
          include: {
            _count: { select: { Questions: true } },
            Dimension: { select: { code: true } },
            UserExamResult: {
              where: { userId },
              orderBy: { createdAt: "desc" },
              take: 1,
              select: { id: true, createdAt: true },
            },
          },
        });

        // 2) Optionally compute answeredCount per exam (needs join via Question.examId)
        const progressByExam: Record<string, number> = {};
        if (includeProgress) {
          // n+1 counts (fine unless your exam list is huge)
          await Promise.all(
            exams.map(async (ex) => {
              const cnt = await prisma.userAnswer.count({
                where: { userId, question: { examId: ex.id } },
              });
              progressByExam[ex.id] = cnt;
            }),
          );
        }

        // 3) Normalize payload
        const payload = exams.map((ex) => {
          const last = ex.UserExamResult[0] ?? null;
          const questionCount = ex._count.Questions;
          const answeredCount = includeProgress
            ? progressByExam[ex.id] ?? 0
            : undefined;

          let status: "not_started" | "completed" | "in_progress" =
            "not_started";
          if (last) status = "completed";
          else if (includeProgress && (answeredCount ?? 0) > 0)
            status = "in_progress";

          return {
            id: ex.id,
            name: ex.name,
            description: ex.description ?? null,
            questionCount,
            dimensionCodes: ex.Dimension.map((d) => d.code),
            lastResultId: last?.id ?? null,
            lastTakenAt: last?.createdAt?.toISOString() ?? null,
            status,
            ...(includeProgress ? { answeredCount } : {}),
          };
        });

        return payload;
      },
    }),
  } as const;
}

const getTasksTool = (userId: string) => {
  return tool({
    description: `Use this tool to get the user's tasks.`,
    inputSchema: z.object({
      question: z.string().describe("the users question"),
    }),
    execute: async ({}) => {
      const tasks = await prisma.userTask.findMany({ where: { userId } });
      return tasks;
    },
  });
};

const getExamResultsTool = (userId: string) => {
  return tool({
    description: `Use this tool to get the user's exam results.`,
    inputSchema: z.object({
      question: z.string().describe("the users question"),
    }),
    execute: async ({}) => {
      const results = await prisma.userExamResult.findMany({
        where: { userId },
      });
      return results;
    },
  });
};

const getUserSenariosTool = (userId: string) => {
  return tool({
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
  });
};

const getScenarioLinkTool = (userId: string) => {
  return tool({
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
  });
};

const getUserDataTool = (userId: string) => {
  return tool({
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
  });
};

const getUserInfoTool = (userId: string) => {
  return tool({
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
  });
};

export {
  buildTools,
  getTasksTool,
  getExamResultsTool,
  getUserSenariosTool,
  getScenarioLinkTool,
  getUserDataTool,
  getUserInfoTool,
};
