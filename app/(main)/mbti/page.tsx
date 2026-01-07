import LandingExamForum from "@/components/exam/LandingExamForum";
import { prisma } from "@/prisma/prisma";

export default async function MBTITestPage() {
  const exam = await prisma.exam.findFirst({
    where: { name: "MBTI_Full" },
    include: {
      Questions: true,
    },
  });
  return (
    <div className='flex flex-col p-10 gap-6 place-self-center w-dvw items-center justify-center h-dvh relative'>

      <div className='flex flex-col gap-5 bg-glass md:p-20 p-3 z-30 rounded-md'>
        <h2>آزمون تیپ شخصیتی MBTI (Myers-Briggs Type Indicator)</h2>

        <LandingExamForum exam={exam} mode='step' />
      </div>
    </div>
  );
}
