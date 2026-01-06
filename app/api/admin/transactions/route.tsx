import { IsAuthenticatedAdmin } from "@/auth/AuthFunctions";
import { Transaction_GetAll } from "@/prisma/functions/Transaction/Transaction";

export async function GET() {
  const user = await IsAuthenticatedAdmin();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const transactions = await Transaction_GetAll();
  return new Response(JSON.stringify(transactions), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
