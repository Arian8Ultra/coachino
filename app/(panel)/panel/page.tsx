import { IsAuthenticated } from "@/auth/AuthFunctions";
import MainChatUIStream from "@/components/chat/MainChatUIStream";
import { getChatExamQuestionsAndUserAnswers } from "@/function/question/QuestionFunctions";
import { Scenario_GetByUser } from "@/prisma/functions/Scenario/ScenarioFun";

export default async function Home() {
  const user = await IsAuthenticated();
  if (!user) {
    return <div>لطفا وارد شوید تا بتوانید این صفحه را مشاهده کنید.</div>;
  }
  const { questions, userAnswers } = await getChatExamQuestionsAndUserAnswers(
    user.id,
  );
  const userScenarios = await Scenario_GetByUser(user.id);

  return (
    <div className='flex-1 h-full'>
      <MainChatUIStream
        questions={questions}
        userAnswers={userAnswers}
        userSenarios={userScenarios}
      />
    </div>
  );
}
