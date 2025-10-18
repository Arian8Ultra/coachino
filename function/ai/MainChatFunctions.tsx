import { GetUserData, UserDataSchema } from "@/lib/rag";
import { computeAndSaveUserExamResult } from "@/lib/score-exam";
import { prisma } from "@/prisma/prisma";
import { tool } from "ai";
import z from "zod";

const SubmitPayloadSchema = z.object({
  examId: z.string(),
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
        "Fetch an exam by id with its questions for rendering to the user. provide every detail you have about the question like anchors and everything. and also write the question like a question with the anchors and everything below the question you can use markdown format. if we dont have any examId then use cmgife4qx0000fyzww97um6sj as the default examId. ask every question one by one. make it like a conversation. and also make it like a single choice question with the options below the question. make sure you asked every question for the exam.",
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
          exam = await prisma.exam.findFirst({
            where: { id: "cmgife4qx0000fyzww97um6sj" },
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
    submitQuestionAnswer: tool({
      description:
        "Submit an answer for a specific question in an exam. make sure the question id is correct. use the 'getExamQuestionsById' tool to get the question ids. if the user answer is not valid convert it to a valid answer. for example if the answer is between 1-5 make sure its one of these values.one is کاملاً به الف نزدیکم, دو is تا حدی به الف نزدیکم, سه is نه به الف نزدیکم نه به ب, چهار is تا حدی به ب نزدیکم, پنج is کاملاً به ب نزدیکم. so the answer should be one of these values 1,2,3,4,5.",
      inputSchema: z.object({
        questionId: z.string().describe("The question id"),
        answer: z
          .number()
          .min(1)
          .max(5)
          .describe("The user's answer between 1-5"),
      }),
      execute: async ({ questionId, answer }) => {
        // Upsert user answer
        // find the question to get the exam id
        const question = await prisma.question.findUnique({
          where: { id: questionId },
          select: { id: true, examId: true },
        });

        if (!question) {
          return { error: "Question not found give a valid questionId" };
        }
        const existing = await prisma.userAnswer.findFirst({
          where: { questionId: questionId, userId: userId },
          select: { id: true },
        });

        if (existing) {
          await prisma.userAnswer.update({
            where: { id: existing.id },
            data: { answer: String(answer) },
          });
        } else {
          await prisma.userAnswer.create({
            data: {
              questionId: questionId,
              userId: userId,
              answer: String(answer),
            },
          });
        }

        return { ok: true };
      },
    }),
    submitExamAnswers: tool({
      description:
        "Make sure user answered all questions before submitting with using checkIfUserAnsweredAllQuestions. Submit and compute and save the scored result. use the exam id of cmgife4qx0000fyzww97um6sj if you dont have any examId. get the id of the question from the getExamQuestionsById tool make sure the ids are correct",
      inputSchema: SubmitPayloadSchema,
      execute: async ({ examId, durationMs, examVersion }) => {
        // Load the exam & allowed question ids
        const exam = await prisma.exam.findUnique({
          where: { id: examId || "cmgife4qx0000fyzww97um6sj" },
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
    checkIfUserAnsweredAllQuestions: tool({
      description:
        "Check if the user has answered all questions in a specific exam. use the exam id of cmgife4qx0000fyzww97um6sj if you dont have any examId. get the id of the question from the getExamQuestionsById tool make sure the ids are correct",
      inputSchema: z.object({
        examId: z.string().optional().describe("The exam id"),
      }),
      execute: async ({ examId }) => {
        const exam = await prisma.exam.findUnique({
          where: { id: examId || "cmgife4qx0000fyzww97um6sj" },
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
    generateScenarioLink: tool({
      description:
        "when the user answer all of its questions ,generate a link to the scenarios page for the user. The link should be in the format: `/panel/exams/${examId}/${resultId}/scenarios`",
      inputSchema: z.object({
        examId: z.string().describe("The exam ID"),
      }),
      execute: async ({ examId }) => {
        const resultId = await prisma.userExamResult.findFirst({
          where: { examId, userId },
          select: { id: true },
        });
        if (!resultId) return { error: "Result not found" };
        return {
          link: `/panel/exams/${examId}/${resultId.id}/scenarios`,
        };
      },
    }),
    getNotAnsweredQuestions: tool({
      description:
        "Get the list of question ids that the user has not answered yet for a specific exam. use the exam id of cmgife4qx0000fyzww97um6sj if you dont have any examId. get the id of the question from the getExamQuestionsById tool make sure the ids are correct",
      inputSchema: z.object({
        examId: z.string().optional().describe("The exam id"),
      }),
      execute: async ({ examId }) => {
        const exam = await prisma.exam.findUnique({
          where: { id: examId || "cmgife4qx0000fyzww97um6sj" },
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
    getQuestionIdFromDetails: tool({
      description:
      "Use this tool to get the question id from the question details if you lost it.",
      inputSchema: z.object({
        questionDetails: z.string().describe("The question body"),
      }),
      outputSchema: z.object({
        questionId: z.string().describe("The question id"),
      }),
      execute: async ({ questionDetails }) => {
        const question = await prisma.question.findFirst({
          where: { question: questionDetails },
          select: { id: true },
        });
        console.log("questionDetails", questionDetails, question);
        
        if (!question) return { error: "Question not found" };
        return { questionId: question.id };
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

export { buildTools };
