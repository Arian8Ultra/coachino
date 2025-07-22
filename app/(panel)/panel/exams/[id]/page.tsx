import { GetCurrentUser } from "@/auth/AuthFunctions";
import ExamForum from "@/components/exam/ExamForum";
import ResultCard from "@/components/panel/result/ResultCard";
import ScenarioCard from "@/components/panel/scenario/ScenarioCard";
import {
  Exam_GetById,
  Exam_GetUserAnswers,
  Exam_GetUserResult,
} from "@/prisma/functions/Exam/ExamFun";
import { Scenario_GetByExamAndUser } from "@/prisma/functions/Scenario/ScenarioFun";
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
  const scenario = await Scenario_GetByExamAndUser(id, user?.id || "");

  const userAnswers = await Exam_GetUserAnswers(id, user?.id || "");
  return (
    <div className='flex flex-col gap-10 p-10'>
      <div className='flex flex-col gap-2'>
        <h2 className='text-3xl'>{exam ? exam.name : "آزمون یافت نشد"}</h2>
        <p>{exam ? exam.description : ""}</p>
      </div>

      {userAnswers?.length ?? 0 > 0 ? (
        <div className='flex flex-col gap-4'>
          <h3>
            پاسخ های شما برای این آزمون ثبت شده است:
          </h3>
          {userAnswers?.length ?? 0 > 0 ? (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {userAnswers?.map((answer) => (
                <div
                  key={answer.id}
                  className='p-4 border rounded-md bg-gradient-to-r from-blue-500/10 to-pink-600/20'
                >
                  <h4>{answer.question.question}</h4>
                  <p>
                    <span className="text-sm text-blue-500 me-2">پاسخ شما:</span>

                    {answer.answer}
                  </p>
                </div>
              ))}
              <ResultCard
                userResult={userResult}
                exam={exam}
                token={token}
                className='col-span-full'
              />
              {userResult && (
                <ScenarioCard
                  examId={id}
                  scenario={scenario}
                  userId={user?.id || ""}
                  className='col-span-full'
                  viewButton
                />
              )}
            </div>
          ) : (
            <p>هیچ جوابی ثبت نشده است. لطفاً آزمون را تکمیل کنید.</p>
          )}
        </div>
      ) : (
        <ExamForum exam={exam} token={token} />
      )}
    </div>
  );
}
