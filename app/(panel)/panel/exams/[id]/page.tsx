import { GetCurrentUser } from "@/auth/AuthFunctions";
import ExamForum from "@/components/exam/ExamForum";
import TopTitle from "@/components/layout/TopTitle/TopTitle";
import ResultCard from "@/components/panel/result/ResultCard";
import ScenarioDetailCard from "@/components/panel/scenario/ScenarioDetailCard";
import {
  Exam_GetById,
  Exam_GetUserAnswers,
  Exam_GetUserResult,
} from "@/prisma/functions/Exam/ExamFun";
import { Scenario_GetByExamAndUser } from "@/prisma/functions/Scenario/ScenarioFun";
import { cookies } from "next/headers";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
      <TopTitle
        title='آزمون'
        h1={exam?.name ? exam.name : undefined}
        iconName='bot'
        sub={exam?.description ? exam.description : undefined}
        containerClassName='mb-4'
      />
      {userResult ? (
        <div className='flex flex-col gap-4 w-full'>
          <Accordion type='single' collapsible className='w-full '>
            <AccordionItem
              value='item-1'
              className='w-full bg-glass rounded-md p-3'
            >
              <AccordionTrigger className='w-full'>
                پاسخ‌های شما به آزمون
              </AccordionTrigger>
              <AccordionContent>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full'>
                  {userAnswers?.map((answer) => (
                    <div key={answer.id} className='p-4 rounded-md bg-glass'>
                      <h4>{answer.question.question}</h4>
                      <p>
                        <span className='text-sm text-blue-500 me-2'>
                          پاسخ شما:
                        </span>

                        {
                          // answers are in the format of string but can be array of strings like ["طوفان فکری ایده‌ها","تحلیل داده‌ها"] if the question type is multiple choice
                          answer.answer.includes("[")
                            ? answer.answer.replace(/[\[\]"]/g, "").split(",").join(", ")
                            : answer.answer
                        }
                      </p>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <ResultCard
            userResult={userResult}
            exam={exam}
            token={token}
            className='col-span-full'
            scenarioId={scenario?.id}
          />
          {scenario && (
            <ScenarioDetailCard
              scenario={scenario}
              className='col-span-full'
            />
          )}
        </div>
      ) : (
        <ExamForum exam={exam} token={token} />
      )}
    </div>
  );
}
