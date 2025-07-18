import { GetCurrentUser } from "@/auth/AuthFunctions";
import ExamForum from "@/components/exam/ExamForum";
import GetAnswerButton from "@/components/exam/GetAnswerButton";
import Bdiv from "@/components/layout/Bdiv";
import {
  Exam_GetById,
  Exam_GetUserAnswers,
  Exam_GetUserResult,
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
  const userResult = await Exam_GetUserResult(id, user?.id || "");

  const userAnswers = await Exam_GetUserAnswers(id, user?.id || "");
  return (
    <div className='flex flex-col gap-10 p-10'>
      <div className='flex flex-col gap-2'>
        <h2 className="text-3xl">{exam ? exam.name : "Exam not found"}</h2>
        <p>{exam ? exam.description : "No description available"}</p>
      </div>

      {userAnswers?.length ?? 0 > 0 ? (
        <div className='flex flex-col gap-4'>
          <h3>Your Answers</h3>
          {userAnswers?.length ?? 0 > 0 ? (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {userAnswers?.map((answer) => (
                <div key={answer.id} className='p-4 border rounded-md bg-gradient-to-r from-blue-500/10 to-pink-600/20'>
                  <h4>{answer.question.question}</h4>
                  <p>Your Answer: {answer.answer}</p>
                </div>
              ))}
              {userResult ? (
                <div className='col-span-full p-4 border rounded-md grid grid-cols-1 gap-4 items-center justify-items-center md:grid-cols-3 lg:grid-cols-4'>
                  <Bdiv
                    className='rounded-md h-full w-full'
                    innerClassName='rounded-md p-3 flex flex-col item-center justify-evenly'
                  >
                    <h4 className='text-lg font-semibold text-center'>
                      Your Result
                    </h4>
                    <p className='bg-gradient-to-r from-blue-500 to-pink-500 text-white p-1 rounded-full w-fit px-5 mx-auto'>
                      {userResult.result}
                    </p>
                  </Bdiv>
                  <Bdiv
                    className='rounded-md md:col-span-2 w-full'
                    innerClassName='rounded-md p-3 flex flex-col gap-3 item-center justify-center'
                  >
                    <h4 className='text-lg font-semibold'>
                      Your Result Ddescription
                    </h4>
                    <p className='bg-gradient-to-r from-blue-500 to-pink-500 text-white p-1 rounded w-fit px-5 mx-auto'>
                      {userResult.description}
                    </p>
                  </Bdiv>
                  <Bdiv
                    className='rounded-md col-span-full'
                    innerClassName='rounded-md p-3 flex flex-col gap-3 item-center justify-center'
                  >
                    <h4 className='text-lg font-semibold'>
                      Your Result Details
                    </h4>
                    <p className='bg-gradient-to-r from-blue-500 to-pink-500 text-white p-1 rounded w-fit px-5 mx-auto'>
                      {userResult.details}
                    </p>
                  </Bdiv>
                </div>
              ) : (
                <GetAnswerButton
                  examId={exam?.id || ""}
                  token={token}
                  className='col-span-full rounded-full'
                />
              )}
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
