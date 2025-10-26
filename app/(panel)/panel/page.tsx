import MainChatUI from "@/components/chat/MainChatUI";
import { getChatExamQuestionsAndUserAnswers } from "@/function/question/QuestionFunctions";

export default async function Home() {
  const { questions, userAnswers } = await getChatExamQuestionsAndUserAnswers();
  return <div className="flex-1 h-full">
    <MainChatUI questions={questions} userAnswers={userAnswers} />
  </div>;
}
