import { GetCurrentUser } from "@/auth/AuthFunctions";
import { prisma } from "@/prisma/prisma";
export async function POST(request: Request) {
  const body = await request.json();
  console.log("Received body:", body);

  const { examId, userAnswers } = body;
  if (!examId || !userAnswers) {
    return new Response("Invalid request", { status: 400 });
  }
  const user = await GetCurrentUser();

  console.log("userId", user?.id);

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

    userAnswers.forEach(
      async (answer: { questionId: string; answer: string | string[] }) => {
        await prisma.userAnswer.create({
          data: {
            answer:
              typeof answer.answer === "string"
                ? answer.answer
                : JSON.stringify(answer.answer),
            questionId: answer.questionId,
            userId: user.id,
          },
        });
        console.log(`Answer submitted for question ${answer.questionId}`);
      },
    );

    return new Response("Answers submitted successfully", { status: 200 });
  } catch (error) {
    console.error("Error submitting answers:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
