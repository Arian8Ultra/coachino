import { IsAuthenticated } from "@/auth/AuthFunctions";
import { prisma } from "@/prisma/prisma";

export async function GET(request: Request) {
  const user = await IsAuthenticated();
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }
  // check for query params
  const url = new URL(request.url);
  const id = url.searchParams.get("id");



  if (id) {
    const feedback = await prisma.feedback.findFirst({
      where: {
        id: id,
        userId: user.id,
      },
    });
    return new Response(JSON.stringify(feedback), { status: 200 });
  } else {
    if (user.is_admin === true) {
      const feedbacks = await prisma.feedback.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });
      return new Response(JSON.stringify(feedbacks), { status: 200 });
    }
    const feedbacks = await prisma.feedback.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return new Response(JSON.stringify(feedbacks), { status: 200 });
  }
}

export async function POST(request: Request) {
  const { type, message, url } = await request.json();
  const user = await IsAuthenticated();

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const feedback = await prisma.feedback.create({
    data: {
      userId: user.id,
      type,
      message,
      url,
    },
  });

  return new Response(JSON.stringify(feedback), { status: 201 });
}

export async function PUT(request: Request) {
  const { id, type, message, url } = await request.json();
  const user = await IsAuthenticated();

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const feedback = await prisma.feedback.updateMany({
    where: {
      id,
      userId: user.id,
    },
    data: {
      type,
      message,
      url,
    },
  });

  return new Response(JSON.stringify(feedback), { status: 200 });
}