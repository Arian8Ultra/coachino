import { IsAuthenticated } from "@/auth/AuthFunctions";
import { GetRecommendedMessagesForMainChat } from "@/function/ai/AiFunctions";

export async function GET() {
    const user = await IsAuthenticated();
    if (!user) {
        return new Response("Unauthorized", { status: 401 });
    }
    const recommendations = await GetRecommendedMessagesForMainChat(user.id);
    return new Response(JSON.stringify(recommendations), { status: 200 });
}