import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/prisma/prisma";
import OpenAI from "openai";
import { cookies } from "next/headers";
import { GetUserId } from "@/auth/AuthFunctions";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

// GET: fetch existing recommendations
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const examResultId = url.searchParams.get("resultId");
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const userId = token ? GetUserId(token) : null;

  if (!userId || !examResultId) {
    // هیچ داده‌ای برای نمایش وجود ندارد
    return NextResponse.json([], { status: 200 });
  }

  const recs = await prisma.recommendedScenario.findMany({
    where: { userId, examResultId },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(recs);
}

// POST: generate & persist four recommendations
export async function POST(req: NextRequest) {
  const { examId, examResultId } = await req.json();
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const userId = token ? GetUserId(token) : null;
  if (!userId) {
    // کاربر احراز هویت نشده است
    return NextResponse.json({ error: "کاربر احراز هویت نشده است" }, { status: 401 });
  }

  // fetch exam & userExamResult & answers
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: { Questions: true },
  });
  const result = await prisma.userExamResult.findUnique({
    where: { id: examResultId },
  });
  const answers = await prisma.userAnswer.findMany({
    where: { userId, questionId: { in: exam!.Questions.map((q) => q.id) } },
    include: { question: true },
  });

  const chat = await prisma.chat.findFirst({
    where: { userExamResultId: examResultId, userId },
    orderBy: { createdAt: "desc" },
  });
  const messges = await prisma.message.findMany({
    where: { chatId: chat?.id },
    orderBy: { createdAt: "asc" },
  });

  // format for prompt
  const formatted = answers
    .map((ua, i) => `سؤال ${i + 1}: ${ua.question.question}\n→ پاسخ: ${ua.answer}`)
    .join("\n\n");

  const systemPrompt = `
شما یک هوش‌ مصنوعی مربی هستید.
پاسخ‌ها را به زبان **فارسی** ارائه دهید.
با توجه به آزمون "${exam!.name}" و نتیجه کاربر (${result!.result})، **چهار** سناریوی شخصی‌سازی‌شده تولید کنید. هر سناریو باید شامل موارد زیر باشد:
- name: یک عنوان کوتاه
- description: یک خلاصه کوتاه
- details: راهنمای کامل "String"
- approximateTime: مدت زمان تقریبی به روز "Int"
- best: یک فلگ بولی (true برای بهترین سناریو، false برای بقیه)
فقط یک آرایه JSON حاوی این چهار شیء برگردانید و هیچ چیز اضافی.
مدت زمان تقریبی سناریوها باید با توجه به نتیجه آزمون و پاسخ‌های کاربر تنظیم شود. و بر اساس مطلب داده شده به کاربر باید واقع بینانه باشد. باید به کاربر استراحت هم داد و زمان ها باید بیشتر یک ماه هم باشد.
`.trim();

  const userPrompt = `
پاسخ‌های آزمون کاربر:
${formatted}

نتیجه آزمون: ${result!.result} — ${result!.description}
`;

  const userPrompt2 = messges.length
    ? `
متن گفتگو:
${messges
  .map((m) => `${m.role === "user" ? "کاربر" : "کوچینو"}: ${m.content}`)
  .join("\n")}
`
    : "";

  const userPromptFinal = `
${userPrompt}
${userPrompt2}
لطفاً چهار سناریوی متمایز و مناسب نیاز کاربر ارائه دهید.
`.trim();

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPromptFinal },
    ],
  });

  const content = completion.choices[0].message.content;
  const jsonMatch = content?.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error("Invalid JSON array");
  const arr = JSON.parse(jsonMatch[0]);

  // persist scenarios, marking exactly the best one
  const created = [];
  for (const obj of arr) {
    const rec = await prisma.recommendedScenario.create({
      data: {
        name: obj.name,
        description: obj.description,
        details: obj.details,
        approximateTime: obj.approximateTime,
        userId,
        examResultId,
        chosenByCoachino: obj.best === true,
        chatId: chat?.id || "",
      },
    });
    created.push(rec);
  }

  return NextResponse.json(created);
}
