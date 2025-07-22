import { GetCurrentUser } from "@/auth/AuthFunctions";
import { GetLLMResultFA } from "@/function/result/AiResult";
import { Exam_GetUserResult } from "@/prisma/functions/Exam/ExamFun";
import { prisma } from "@/prisma/prisma";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const examId = url.searchParams.get("examId");
  if (!examId) {
    return new Response("Invalid request", { status: 400 });
  }
  const user = await GetCurrentUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const res = await Exam_GetUserResult(examId, user.id);

  if (!res) {
    return new Response("No result found for this exam", { status: 404 });
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const { examId } = body;
  if (!examId) {
    return new Response("Invalid request", { status: 400 });
  }
  const user = await GetCurrentUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }
  try {
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        Questions: true,
      },
    });

    if (!exam) {
      return new Response("Exam not found", { status: 404 });
    }

    const userAnswers = await prisma.userAnswer.findMany({
      where: {
        questionId: {
          in: exam.Questions.map((q) => q.id),
        },
      },
      include: {
        question: true,
      },
    });

    const userAnswersFormatted = userAnswers.map((answer) => ({
      question: answer.question.question,
      answer: answer.answer,
    }));

    const llmres = await GetLLMResultFA(userAnswersFormatted);

    const res = await prisma.userExamResult.create({
      data: {
        userId: user.id,
        examId: exam.id,
        result: llmres.result,
        score: llmres.score,
        details: llmres.details,
        description: llmres.description,
      },
    });

    return new Response(JSON.stringify(res), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching answers:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
