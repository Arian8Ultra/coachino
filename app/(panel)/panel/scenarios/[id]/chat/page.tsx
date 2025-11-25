import ChatUIWithID from "@/components/chat/ChatUIWithID";
import MainChatUI from "@/components/chat/MainChatUI";
import { getChatExamQuestionsAndUserAnswers } from "@/function/question/QuestionFunctions";
import { Scenario_GetById } from "@/prisma/functions/Scenario/ScenarioFun";
import { prisma } from "@/prisma/prisma";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const scenario = await Scenario_GetById(id);
  if (!scenario) {
    return <div>سناریو یافت نشد</div>;
  }
  if (!scenario.chatId) {
    return <div>چت برای این سناریو یافت نشد</div>;
  }
  const { questions, userAnswers } = await getChatExamQuestionsAndUserAnswers();

  const chat = await prisma.chat.findFirst({
    where: {
      id: scenario?.chatId,
    },
    select: {
      isMain: true,
    },
  });
  return (
    <main className='flex flex-col h-full flex-1'>
      {chat?.isMain ? (
        <MainChatUI questions={questions} userAnswers={userAnswers} />
      ) : (
        <ChatUIWithID chatId={scenario?.chatId || ""} scenario={scenario} />
      )}
    </main>
  );
}
