import { prisma } from "@/prisma/prisma";
import { seedMbti10GenericFa } from "@/prisma/seed";

export async function GET(request: Request) {
  if (process.env.NODE_ENV !== "development") {
    return new Response(JSON.stringify({ error: "Not Found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }
  const url = new URL(request.url);
  const examId = url.searchParams.get("examId");
  if (!examId) {
    return new Response("Missing examId query parameter", { status: 400 });
  }
  seedMbti10GenericFa(examId)
    .then(() => {
      console.log("MBTI (FA) seeded successfully");
      return new Response("MBTI (FA) seeded successfully", { status: 200 });
    })
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
  return new Response("MBTI (FA) seeded successfully", { status: 200 });
}
