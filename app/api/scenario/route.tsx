import { GetCurrentUser, IsAuthenticated } from "@/auth/AuthFunctions";
import { GetUserScenario } from "@/function/scenario/Scenario";
import { prisma } from "@/prisma/prisma";

export async function GET(request: Request) {
  //     (
  //   userId: string,
  //   examId: string,
  //   topic: string,
  const url = new URL(request.url);
  const userId = (await GetCurrentUser())?.id || "";
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }
  const examId = url.searchParams.get("examId");
  const topic = url.searchParams.get("topic");

  if (!userId || !examId || !topic) {
    return new Response("Missing required parameters", { status: 400 });
  }

  try {
    console.log(
      "Creating scenario for user:",
      userId,
      "examId:",
      examId,
      "topic:",
      topic,
    );

    const scenatio = await GetUserScenario({
      userId,
      examId,
      topic,
    });
    return new Response(JSON.stringify(scenatio), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(message, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const user = await IsAuthenticated();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }
  const body = await request.json();
  const scenarioId = body.scenarioId;
  if (!scenarioId) {
    return new Response("Missing scenarioId", { status: 400 });
  }

  const scenario = await prisma.scenario.findUnique({
    where: { id: scenarioId, userId: user.id },
  });
  if (!scenario) {
    return new Response("Scenario not found", { status: 404 });
  }
  await prisma.scenario.delete({
    where: { id: scenarioId },
  });
  return new Response("Scenario deleted successfully", { status: 200 });
}
