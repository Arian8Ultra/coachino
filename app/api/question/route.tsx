import { IsAuthenticated } from "@/auth/AuthFunctions";
import { prisma } from "@/prisma/prisma";

export async function GET(request: Request) {
  // get the quesiton id from the url
  const url = new URL(request.url);
  const questionId = url.searchParams.get("questionId");
  const user = await IsAuthenticated();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (!questionId) {
    return new Response("Question ID is required", { status: 400 });
  }

  const question = await prisma.question.findUnique({
    where: { id: questionId },
    include: {
      scale: true,
      QuestionKey: true,
    },
  });
  const userAnswer = await prisma.userAnswer.findFirst({
    where: {
      questionId: questionId,
      userId: user.id,
    },
  });

  return new Response(JSON.stringify({ question, userAnswer }), {
    headers: {
      "Content-Type": "application/json",
    },
    status: 200,
    statusText: "OK",
  });
}

// export async function HEAD(request: Request) {}

// export async function POST(request: Request) {}

// export async function PUT(request: Request) {}

// export async function DELETE(request: Request) {}

// export async function PATCH(request: Request) {}
