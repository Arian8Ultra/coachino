import { prisma } from "@/prisma/prisma";

export async function getChatExamQuestionsAndUserAnswers(userId?: string) {
  "use cache";
  const chatExam = await prisma.exam.findFirst({
    where: {
      useForChat: true,
    },
    select: {
      id: true,
    },
  });
  const questions = await prisma.question.findMany({
    where: {
      examId: chatExam?.id || "",
    },
    include: {
      scale: true,
      QuestionKey: true,
    },
  });
  const userAnswers = await prisma.userAnswer.findMany({
    where: {
      questionId: {
        in: questions.map((q) => q.id),
      },
      userId: userId || "",
    },
  });
  return { questions, userAnswers };
}
