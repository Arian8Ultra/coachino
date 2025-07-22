import LandingGridItem from "@/components/layout/Landing/LandingParts/LandingGrid/LandingGridItem";
import LandingSlider from "@/components/layout/Landing/LandingSlider/LandingSlider";
import Image from "next/image";

export default function Page() {
  return (
    <div className='flex flex-col gap-5 p-5 md:p-10 snap-always snap-y snap-mandatory'>
      <LandingSlider className='max-h-[50dvh] md:max-h-max' />
      <div className='flex flex-wrap gap-24 my-20 snap-always snap-y snap-mandatory'>
        <LandingGridItem className='w-full flex md:flex-row flex-col not-only-of-type:items-center justify-between'>
          <div className='flex flex-col gap-3 h-full justify-evenly'>
            <h2 className='md:text-7xl text-3xl font-bold'>انگیزهٔ روزانه</h2>
            <p className='text-gray-600 dark:text-gray-400 text-2xl md:max-w-2/3 *:leading-8 text-justify'>
              هر روز با نقل‌قول‌ها و نکته‌های انگیزشی الهام بگیرید تا در مسیر
              بمانید.
            </p>
          </div>
          <Image
            src={"/landing/daily-motivation.png"}
            alt='Daily Motivation'
            className='w-full md:w-1/2 object-cover aspect-video md:aspect-[1.5/1] rounded-lg'
            width={1000}
            height={1000}
          />
        </LandingGridItem>

        <LandingGridItem className='w-full flex md:flex-row flex-col not-only-of-type:items-center justify-between'>
          <div className='flex flex-col gap-3 h-full justify-evenly'>
            <h2 className='md:text-7xl text-3xl font-bold'>
              هدف خود را تعیین کنید
            </h2>
            <p className='text-gray-600 dark:text-gray-400 text-2xl md:max-w-2/3 *:leading-8 text-justify'>
              اهداف مبهم خود را به هدفی شفاف و دقیق تبدیل کنید. کوچینو به شما
              کمک می‌کند نقاط عطف قابل‌سنجش تعیین کنید و همان لحظه نخستین گام
              عملی را پیش رویتان بگذارد.
            </p>
          </div>
          <Image
            src={"/landing/set-your-goal.png"}
            alt='Daily Motivation'
            className='w-full md:w-1/2 object-cover aspect-video md:aspect-[1.5/1] rounded-lg'
            width={1000}
            height={1000}
          />
        </LandingGridItem>
        <LandingGridItem className='w-full flex md:flex-row flex-col not-only-of-type:items-center justify-between'>
          <div className='flex flex-col gap-3 h-full justify-evenly'>
            <h2 className='md:text-7xl text-3xl font-bold'>
              پیشرفت خود را پیگیری کنید
            </h2>
            <p className='text-gray-600 dark:text-gray-400 text-2xl md:max-w-2/3 *:leading-8 text-justify'>
              رشد پی‌درپی رکوردهایتان را تماشا کنید، نقاط عطف را ببینید که روشن
              می‌شوند و روندها را در لحظه تغییر می‌کنند. بازخورد بصری شما را
              صادق، متمرکز و مشتاق به پیشروی بیشتر نگه می‌دارد.
            </p>
          </div>
          <Image
            src={"/landing/track-progress.png"}
            alt='Daily Motivation'
            className='w-full md:w-1/2 object-cover aspect-video md:aspect-[1.5/1] rounded-lg'
            width={1000}
            height={1000}
          />
        </LandingGridItem>
      </div>
    </div>
  );
}
