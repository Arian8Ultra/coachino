import { IsAuthenticated } from "@/auth/AuthFunctions";
import MainChatUIStream from "@/components/chat/MainChatUIStream";
import { getChatExamQuestionsAndUserAnswers } from "@/function/question/QuestionFunctions";

export default async function Home() {
  const user = await IsAuthenticated();
  if (!user) {
    return <div>لطفا وارد شوید تا بتوانید این صفحه را مشاهده کنید.</div>;
  }
  const { questions, userAnswers } = await getChatExamQuestionsAndUserAnswers(
    user.id,
  );
  return (
    <div className='flex-1 h-full'>
      <MainChatUIStream questions={questions} userAnswers={userAnswers} />
    </div>
  );
}
