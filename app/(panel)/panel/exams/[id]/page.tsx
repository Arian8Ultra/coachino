import { GetCurrentUser } from "@/auth/AuthFunctions";
import ExamForum from "@/components/exam/ExamForum";
import {
  Exam_GetById,
  Exam_GetUserAnswers,
} from "@/prisma/functions/Exam/ExamFun";
import { cookies } from "next/headers";

export default async function ExamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const exam = await Exam_GetById(id);
  const cookie = await cookies();
  const token = cookie.get("token")?.value || "";

  const user = await GetCurrentUser();

  const userAnswers = await Exam_GetUserAnswers(id, user?.id || "");
  return (
    <div className='flex flex-col gap-10 p-10'>
      <div className='flex flex-col gap-2'>
        <h2>{exam ? exam.name : "Exam not found"}</h2>
        <p>{exam ? exam.description : "No description available"}</p>
      </div>

      {userAnswers.length > 0 ? (
        <div className='flex flex-col gap-4'>
          <h3>Your Answers</h3>
          {userAnswers.length > 0 ? (
            <div
              className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols
-3 gap-4'
            >
              {userAnswers.map((answer) => (
                <div key={answer.id} className='p-4 border rounded'>
                  <h4>{answer.question.question}</h4>
                  <p>Your Answer: {answer.answer}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>No answers found for this exam.</p>
          )}
        </div>
      ) : (
        <ExamForum exam={exam} token={token} />
      )}
    </div>
  );
}
