// app/api/chat/init/route.ts
import { GetUserId } from "@/auth/AuthFunctions";
import { prisma } from "@/prisma/prisma";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
export async function POST(req: NextRequest) {
  const { userExamResultId } = (await req.json()) as {
    userExamResultId: string;
  };

  // 1. Auth
  const cookie = await cookies();
  const token = cookie.get("token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const userId = GetUserId(token);
  if (!userId) {
    return NextResponse.json({ error: "Invalid user" }, { status: 401 });
  }

  // 2. Fetch the exam result
  const examResult = await prisma.userExamResult.findUnique({
    where: { id: userExamResultId },
    select: { result: true, description: true },
  });
  if (!examResult)
    return NextResponse.json(
      { error: "Exam result not found" },
      { status: 404 },
    );

  // if the userExamResultId does not belong to the user, return 403
  const belongsToUser = await prisma.userExamResult.findFirst({
    where: { id: userExamResultId, userId },
  });
  if (!belongsToUser) {
    return NextResponse.json(
      { error: "You do not have access to this exam result" },
      { status: 403 },
    );
  }

  //   if the result already has a chat, return that chat and its messages
  const existingChat = await prisma.chat.findFirst({
    where: { userExamResultId },
  });
  if (existingChat) {
    const existingMessages = await prisma.message.findMany({
      where: { chatId: existingChat.id },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({
      chatId: existingChat.id,
      messages: existingMessages.map((m) => ({
        role: m.role,
        content: m.content,
        type: m.type,
        url: m.url,
        text: m.linkTitle, // Assuming linkTitle is used for link text
      })),
    });
  }

  // 3. Create a new Chat tied to that exam result
  const chat = await prisma.chat.create({
    data: {
      userId,
      userExamResultId, // ← links Chat → UserExamResult
      model: "GPT_4_O",
    },
  });

  // 4. Build your assistant’s opening prompt
  const opening =
    `سلام! بر اساس نتایج آزمون MBTI شما (${examResult.result})—${examResult.description}—` +
    `در چه زمینه‌ای نیاز به راهنمایی و توصیه دارید؟`;

  // 5. Persist that assistant message
  await prisma.message.create({
    data: {
      chatId: chat.id,
      userId, // Or null if you prefer system messages
      role: "assistant",
      content: opening,
      type: "text", // Assuming this is a text message
      url: null, // No URL for text messages
      linkTitle: null, // No link title for text messages
    },
  });

  // 6. Return to client
  return NextResponse.json({
    chatId: chat.id,
    messages: [{ role: "assistant", content: opening }],
  });
}
