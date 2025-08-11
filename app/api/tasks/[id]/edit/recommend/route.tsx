import { GetUserId } from "@/auth/AuthFunctions";
import { GenerateNewTask } from "@/function/scenario/Scenario";
import { cookies } from "next/headers";


export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }
  const userId = GetUserId(token);
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = (await request.json()) as {
    userInput: string;
    taskId: string;
  };
  if (!body.userInput || !body.taskId) {
    return new Response("Bad Request", { status: 400 });
  }

  const res = await GenerateNewTask(userId, body.taskId, body.userInput);

  if (!res) {
    return new Response("Failed to generate new task", { status: 500 });
  }
  return new Response(JSON.stringify(res), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}