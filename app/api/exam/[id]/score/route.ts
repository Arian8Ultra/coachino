// app/api/exams/[examId]/score/route.ts
import { GetUserId } from "@/auth/AuthFunctions";
import {
  computeAndSaveUserExamResult
} from "@/lib/score-exam";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const userId = token ? GetUserId(token) : null;
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const examId = url.searchParams.get("examId");
  if (!examId)
    return NextResponse.json(
      { error: "Missing examId query parameter" },
      { status: 400 },
    );

  const saved = await computeAndSaveUserExamResult({
    examId: examId,
    userId,
  });

  return NextResponse.json({ id: saved.id }, { status: 200 });
}
