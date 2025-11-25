import { IsAuthenticated } from "@/auth/AuthFunctions";
import { decodeMessage } from "@/auth/Encoder";

export async function GET(request: Request) {
  if (process.env.NODE_ENV !== "development") {
    return new Response(JSON.stringify({ error: "Not Found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return new Response(JSON.stringify({ error: "Code is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  const user = await IsAuthenticated();
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  const decode = decodeMessage(code, user?.id || "public");

  return new Response(JSON.stringify({ decoded: decode }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
