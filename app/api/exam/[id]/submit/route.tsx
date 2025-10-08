/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/exams/[examId]/submit/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { GetUserId } from "@/auth/AuthFunctions";
import { prisma } from "@/prisma/prisma";
import { computeAndSaveUserExamResult } from "@/lib/score-exam";

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const userId = token ? GetUserId(token) : null;
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const durationMs =
    typeof body?.durationMs === "number" ? body.durationMs : undefined;
  const examVersion =
    typeof body?.examVersion === "string" ? body.examVersion : undefined;
  const userAnswers = Array.isArray(body?.userAnswers) ? body.userAnswers : [];
  const examId = body?.examId;

  // save answers (replace previous for this exam)
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: { Questions: { select: { id: true } } },
  });
  if (!exam)
    return NextResponse.json({ error: "Exam not found" }, { status: 404 });

  const allowed = new Set(exam.Questions.map((q) => q.id));
  const rows = userAnswers
    .filter((a: any) => a && allowed.has(a.questionId))
    .map((a: any) => ({
      userId,
      questionId: a.questionId,
      answer:
        typeof a.answer === "string" ? a.answer : JSON.stringify(a.answer),
    }));

  await prisma.$transaction([
    prisma.userAnswer.deleteMany({
      where: { userId, questionId: { in: Array.from(allowed) } },
    }),
    rows.length
      ? prisma.userAnswer.createMany({ data: rows })
      : prisma.$executeRaw`SELECT 1`,
  ]);

  // compute + persist result
  const saved = await computeAndSaveUserExamResult({
    examId: examId,
    userId,
    durationMs,
    examVersion,
  });

  return NextResponse.json({ id: saved.id }, { status: 200 });
}
