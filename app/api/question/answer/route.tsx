import { IsAuthenticated } from "@/auth/AuthFunctions";
import { prisma } from "@/prisma/prisma";

export async function POST(request: Request) {
  // get the quesiton id and the answer in the body and save it
  const { questionId, answer } = await request.json();
  const user = await IsAuthenticated();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }
  const userId = user.id;
  const question = await prisma.question.findUnique({
    where: { id: questionId },
    select: { id: true, examId: true },
  });
  const qID = question?.id;

  if (!qID) {
    return new Response("Question not found", { status: 404 });
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

  return new Response("Answer saved", { status: 200 });
}
