import { IsAuthenticatedAdmin } from "@/auth/AuthFunctions";
import { prisma } from "@/prisma/prisma";
import { seedMbtiGenericFa } from "@/prisma/seed";

export async function GET() {
  const user = await IsAuthenticatedAdmin();

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  let examId = null;
  const exam = await prisma.exam.findFirst({
    where: { name: "MBTI_Full" },
  });
  if (exam) {
    examId = exam.id;
  } else {
    const newExam = await prisma.exam.create({
      data: {
        name: "MBTI_Full",
        description: "یک تست شخصیت مبتنی بر شاخص مایرز‑بریگز کامل",
      },
    });
    examId = newExam.id;
  }

  const seed = await seedMbtiGenericFa(examId);
  return new Response(JSON.stringify({ message: "Seeding completed", seed }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
