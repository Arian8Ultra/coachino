import { IsAuthenticatedAdmin } from "@/auth/AuthFunctions";
import { initCronJobs } from "@/lib/cron/init";

export async function GET() {
  const user = await IsAuthenticatedAdmin();
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  if (process.env.NODE_ENV == "development") return;

  initCronJobs();

  return new Response("Cron jobs initialized", { status: 200 });
}
