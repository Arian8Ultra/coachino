import ChatUIWithID from "@/components/chat/ChatUIWithID";
import { Scenario_GetById } from "@/prisma/functions/Scenario/ScenarioFun";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const scenario = await Scenario_GetById(id);
  return (
    <main className='flex flex-col'>
      <ChatUIWithID chatId={scenario?.chatId || ""} scenario={scenario} />
    </main>
  );
}
