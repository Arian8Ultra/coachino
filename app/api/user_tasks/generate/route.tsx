import { GetCurrentUser } from "@/auth/AuthFunctions";
import { GetUserSenarioTasks } from "@/function/scenario/Scenario";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const examId = url.searchParams.get("examId");
  const scenarioId = url.searchParams.get("scenarioId");
  const user = await GetCurrentUser();
  const userId = user?.id;
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (!examId || !scenarioId) {
    return new Response("Missing required parameters examId or scenarioId", { status: 400 });
  }

  try {
    const scenarioTasks = await GetUserSenarioTasks(userId, examId, scenarioId);
    return new Response(JSON.stringify(scenarioTasks), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(message, { status: 500 });
  }
}
