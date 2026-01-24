import { createAttemptId } from "@/auth/AuthFunctions";
import { NextResponse } from "next/server";

export async function POST() {
  const attemptId = createAttemptId();

  const res = NextResponse.json({
    attemptId,
  });

  res.cookies.set("exam_attempt", attemptId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60, // 1 hour
    path: "/",
  });

  return res;
}