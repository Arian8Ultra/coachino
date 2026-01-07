import LandingExamForum from "@/components/exam/LandingExamForum";
import TopTitle from "@/components/layout/TopTitle/TopTitle";
import { prisma } from "@/prisma/prisma";

export default async function MBTITestPage() {
  const exam = await prisma.exam.findFirst({
    where: { name: "MBTI_Full" },
    include: {
      Questions: true,
    },
  });
  return (
    <div className='flex flex-col p-10 gap-10 place-self-center w-dvw items-center justify-center h-dvh relative'>
      <TopTitle
        title='آزمون MBTI'
        h1='تیپ شخصیتی خود را بشناسید'
        iconName='bot'
        sub='آزمون تیپ شخصیتی MBTI (Myers-Briggs Type Indicator) یکی از محبوب‌ترین و معتبرترین آزمون‌های روانشناسی است که به شما کمک می‌کند تا بهتر خودتان را بشناسید و نقاط قوت و ضعف شخصیت خود را درک کنید.'
        containerClassName='mb-4 text-center'
      />

      <div className='flex flex-col gap-5 bg-glass md:p-20 p-3 z-30 rounded-md'>
        <LandingExamForum exam={exam} mode='step' />
      </div>
    </div>
  );
}
