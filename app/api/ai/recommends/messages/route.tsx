import { IsAuthenticated } from "@/auth/AuthFunctions";
import { GetRecommendedMessagesForMainChat } from "@/function/ai/AiFunctions";

export async function GET() {
  const user = await IsAuthenticated();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }
  try {
    const recommendations = await GetRecommendedMessagesForMainChat(user.id);
    return new Response(JSON.stringify(recommendations), { status: 200 });
  } catch (error) {
    console.error("Error getting recommended messages:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
