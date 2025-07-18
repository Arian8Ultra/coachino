import { GetCurrentUser } from "@/auth/AuthFunctions";
import { prisma } from "@/prisma/prisma";
export async function POST(request: Request) {
  const body = await request.json();
  const { questionId, answer } = body;
  if (!questionId || !answer) {
    return new Response("Invalid request", { status: 400 });
  }
  const user = await GetCurrentUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }
  try {
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        exam: true,
      },
    });

    if (!question) {
      return new Response("Question not found", { status: 404 });
    }

    const res = await prisma.userAnswer.create({
      data: {
        answer: answer,
        questionId: questionId,
        userId: user.id,
      },
    });
    return new Response(JSON.stringify(res), { status: 200 });
  } catch (error) {
    console.error("Error submitting answers:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
