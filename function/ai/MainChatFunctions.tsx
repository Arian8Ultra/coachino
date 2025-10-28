import { GetUserData, UserDataSchema } from "@/lib/rag";
import { computeAndSaveUserExamResult } from "@/lib/score-exam";
import { prisma } from "@/prisma/prisma";
import { openai } from "@ai-sdk/openai";
import { generateObject, tool } from "ai";
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
        "Fetch an exam by id with its questions for rendering to the user. provide every detail you have about the question like anchors and everything. and also write the question like a question with the anchors and everything below the question you can use markdown format. if we dont have any examId then use cmh63dky30000v16ku340i0hb as the default examId. ask every question one by one. make it like a conversation. and also make it like a single choice question with the options below the question. make sure you asked every question for the exam. each option should be in a separate line and start with a dash (-).",
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
            where: { id: "cmh63dky30000v16ku340i0hb" },
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
        "if the user answered a question then use this tool to submit an answer for a specific question in an exam. make sure the question id is correct. use the 'getExamQuestionsById' tool to get the question ids. if the user answer is not valid convert it to a valid answer. for example if the answer is between 1-5 make sure its one of these values.one is کاملاً به الف نزدیکم, دو is تا حدی به الف نزدیکم, سه is نه به الف نزدیکم نه به ب, چهار is تا حدی به ب نزدیکم, پنج is کاملاً به ب نزدیکم. so the answer should be one of these values 1,2,3,4,5.",
      inputSchema: z.object({
        questionId: z.string().describe("The question id"),
        questionText: z.string().describe("The question text"),
        answer: z
          .number()
          .min(1)
          .max(5)
          .describe("The user's answer between 1-5"),
      }),
      execute: async ({ questionId, answer, questionText }) => {
        // Upsert user answer
        // find the question to get the exam id
        const question = await prisma.question.findUnique({
          where: { id: questionId },
          select: { id: true, examId: true },
        });
        let qID = question?.id;

        if (!qID) {
          const exam = await prisma.exam.findUnique({
            where: {
              id: "cmgifem4k0012fyfk7cul3ouu",
            },
            include: {
              Questions: true,
            },
          });

          const res = generateObject({
            model: openai("gpt-4o-mini"),
            messages: [
              {
                role: "system",
                content: `find this question ${questionText} in this exam questions: ${exam?.Questions.map(
                  (q) => q.question,
                ).join(
                  ", ",
                )} and return me only the question id if you found it otherwise return null.`,
              },
            ],
            schema: z.object({
              questionId: z.string().nullable(),
            }),
          });
          console.log("res:", await res);

          const id = (await res).object.questionId;
          if (!id) {
            return "we couldnt find the question id try again and get the question id again and ask the user again";
          }
          qID = id;
        }

        console.log("questionId", qID);

        const existing = await prisma.userAnswer.findFirst({
          where: { questionId: qID, userId: userId },
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
              questionId: qID,
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
    checkIfUserAnsweredAllQuestions: tool({
      description:
        "Check if the user has answered all questions in a specific exam. use the exam id of cmh63dky30000v16ku340i0hb if you dont have any examId. get the id of the question from the getExamQuestionsById tool make sure the ids are correct",
      inputSchema: z.object({
        examId: z.string().optional().describe("The exam id"),
      }),
      execute: async ({ examId }) => {
        const exam = await prisma.exam.findUnique({
          where: { id: examId || "cmh63dky30000v16ku340i0hb" },
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
        "Get the list of question ids that the user has not answered yet for a specific exam. use the exam id of cmh63dky30000v16ku340i0hb if you dont have any examId. get the id of the question from the getExamQuestionsById tool make sure the ids are correct",
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
    // getQuestionIdFromDetails: tool({
    //   description:
    //     "Use this tool to get the question id from the question details if you lost it.",
    //   inputSchema: z.object({
    //     questionDetails: z.string().describe("The question body"),
    //   }),
    //   outputSchema: z.object({
    //     questionId: z.string().describe("The question id"),
    //   }),
    //   execute: async ({ questionDetails }) => {
    //     const question = await prisma.question.findFirst({
    //       where: { question: questionDetails },
    //       select: { id: true },
    //     });
    //     console.log("questionDetails", questionDetails, question);

    //     if (!question) return { error: "Question not found" };
    //     return { questionId: question.id };
    //   },
    // }),
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
        "Get the list of question ids that the user has not answered yet for a specific exam. use the exam id of cmh63dky30000v16ku340i0hb if you dont have any examId. just return the ids one by one in the metaData with the type of the message set as 'question'.\n if the user answered all questions then return an empty array and use 'submitExamAnswers' tool to submit the answers and get the exam result.",
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
          model: openai("gpt-5-nano"),
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
          model: openai("gpt-4o-mini"),
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
  };
}

export { buildTools, newBuildTools };
