import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/prisma/prisma";
import { cookies } from "next/headers";
import { GetUserId } from "@/auth/AuthFunctions";
import { GetUserSenarioTasks } from "@/function/scenario/Scenario";

export async function POST(req: NextRequest) {
  const { recommendedId } = await req.json();
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const userId = token ? GetUserId(token) : null;
  if (!userId)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

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
  const scenario = await prisma.scenario.create({
    data: {
      name: rec!.name,
      description: rec!.description || "",
      details: rec!.details,
      approximateTime: rec!.approximateTime,
      userId,
      examId: rec!.examResult?.examId || "",
      chatId: rec!.chatId,
    },
  });

  const tasks = await GetUserSenarioTasks(
    userId,
    rec!.examResult?.examId || "",
    scenario.id,
  );

  console.log("Tasks for scenario:", tasks);
  
  return NextResponse.json( scenario );
}
