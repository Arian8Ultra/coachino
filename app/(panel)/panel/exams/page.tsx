import { GetUserId } from "@/auth/AuthFunctions";
import ExamCard from "@/components/exam/ExamCard";
import TopTitle from "@/components/layout/TopTitle/TopTitle";
import { prisma } from "@/prisma/prisma";
import { cookies } from "next/headers";

export default async function Page() {
  const exams = await prisma.exam.findMany({
    include: {
      Questions: true,
    },
  });
  const cookie = await cookies();
  const token = cookie.get("token")?.value;
  if (!token) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <h1 className='text-2xl font-bold'>لطفا وارد شوید</h1>
      </div>
    );
  }
  const userId = GetUserId(token);

  const userResults = await prisma.userExamResult.findMany({
    where: { userId },
    include: {
      exam: true,
      Scenario: true,
    },
  });

  return (
    <div className='w-full h-full relative flex flex-col items-center justify-center'>
      <TopTitle
        iconName='bot'
        title='آزمون ها'
        h1='یکی از آزمون هارو انتخاب کنید'
        sub='برای شروع مسیر موفقیت ابتدا یکی از پلن هارو انتخاب کنید'
        containerClassName='mb-4'
      />
      <div className='grid grid-cols-3 gap-4 p-4 w-6xl md:max-w-[70dvw]'>
        {exams.map((exam) => (
          <ExamCard
            exam={exam}
            key={exam.id}
            isAnswered={userResults.some(
              (result) => result.examId === exam.id
            )}
            // className='w-full sm:w-1/2 lg:w-1/3'
          />
        ))}
      </div>
    </div>
  );
}
