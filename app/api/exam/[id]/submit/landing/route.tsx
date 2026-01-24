/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/exams/[examId]/submit/landing/route.ts
import { computeExamResultFromAnswers } from "@/lib/score-exam";
import { prisma } from "@/prisma/prisma";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const durationMs =
    typeof body?.durationMs === "number" ? body.durationMs : undefined;
  const examVersion =
    typeof body?.examVersion === "string" ? body.examVersion : undefined;
  const userAnswers = Array.isArray(body?.userAnswers) ? body.userAnswers : [];
  const examId = body?.examId;
  const attemptId = (await cookies()).get("exam_attempt")?.value;

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
      questionId: a.questionId,
      answer:
        typeof a.answer === "string" ? a.answer : JSON.stringify(a.answer),
    })) as { questionId: string; answer: string }[];

  //     const attemptId = cookies().get("exam_attempt")?.value;
  // if (!attemptId) {
  //   return NextResponse.json(
  //     { error: "Exam attempt not found" },
  //     { status: 400 },
  //   );
  // }

  // 1) Persist answers (idempotent)
  // await prisma.$transaction(
  //   Object.entries(answers).map(([questionId, answer]) =>
  //     prisma.userAnswerLanding.upsert({
  //       where: {
  //         attemptId_questionId: {
  //           attemptId,
  //           questionId,
  //         },
  //       },
  //       update: {
  //         answer,
  //       },
  //       create: {
  //         attemptId,
  //         questionId,
  //         answer,
  //       },
  //     }),
  //   ),
  // );

  // compute + persist result
  const saved = await computeExamResultFromAnswers({
    examId: examId,
    answers: rows,
    durationMs,
    examVersion,
    attemptId,
  });

  return NextResponse.json(saved, { status: 200 });
}
