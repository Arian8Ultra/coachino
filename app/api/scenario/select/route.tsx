import { checkUserSenarioLimit, IsAuthenticated } from "@/auth/AuthFunctions";
import { GetUserSenarioTasks } from "@/function/scenario/Scenario";
import { prisma } from "@/prisma/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { recommendedId } = await req.json();
  const user = await IsAuthenticated();
  if (!user)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  
  const userId = user ? user.id : null;

  const userSenarioLimit = await checkUserSenarioLimit(user);

  if (userSenarioLimit === false)
    return NextResponse.json(
      { error: "Monthly scenario limit reached" },
      { status: 403 },
    );

  // mark chosen
  await prisma.recommendedScenario.update({
    where: { id: recommendedId },
    data: { chosenByUser: true },
  });

  // fetch rec and create real Scenario
  const rec = await prisma.recommendedScenario.findUnique({
    where: { id: recommendedId },
    include: { examResult: true },
  });
  const chatExam = await prisma.exam.findFirst({
    where: { useForChat: true },
  });
  const scenario = await prisma.scenario.create({
    data: {
      name: rec!.name,
      description: rec!.description || "",
      details: rec!.details,
      approximateTime: rec!.approximateTime,
      userId: userId!,
      examId: rec!.examResult?.examId || chatExam?.id || null,
      chatId: rec!.chatId,
    },
  });

  const tasks = await GetUserSenarioTasks(
    userId!,
    rec!.examResult?.examId || "",
    scenario.id,
  );

  console.log("Tasks for scenario:", tasks);

  return NextResponse.json(scenario);
}
