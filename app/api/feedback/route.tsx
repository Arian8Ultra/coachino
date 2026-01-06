import { IsAuthenticated } from "@/auth/AuthFunctions";
import { FeedbackType } from "@/generated/prisma";
import { prisma } from "@/prisma/prisma";

export async function GET() {
  const user = await IsAuthenticated();
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }
  const feedbacks = await prisma.feedback.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return new Response(JSON.stringify(feedbacks), { status: 200 });
}

export async function POST(request: Request) {
  const user = await IsAuthenticated();
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const { message, url, type } = await request.json();
  // Validate input
  if (!user.id || !message) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), {
      status: 400,
    });
  }
  if (type && !Object.values(FeedbackType).includes(type)) {
    return new Response(JSON.stringify({ error: "Invalid feedback type" }), {
      status: 400,
    });
  }
  const feedback = await prisma.feedback.create({
    data: {
      userId: user.id,
      message,
      url,
      type,
    },
  });
  return new Response(JSON.stringify(feedback), { status: 201 });
}
