import LandingGridItem from "@/components/layout/Landing/LandingParts/LandingGrid/LandingGridItem";
import LandingSlider from "@/components/layout/Landing/LandingSlider/LandingSlider";
import Image from "next/image";

export default function Page() {
  return (
    <div className='flex flex-col gap-5 w-full p-10 snap-always snap-y snap-mandatory'>
      <LandingSlider className='h-[500px]' />
      <div className='flex flex-wrap gap-24 my-20 snap-always snap-y snap-mandatory'>
        <LandingGridItem className='w-full flex not-only-of-type:items-center justify-between'>
          <div className='flex flex-col gap-3 h-full justify-evenly'>
            <h2 className='text-7xl font-bold'>Daily Motivation</h2>
            <p className='text-gray-600 dark:text-gray-400 text-2xl max-w-2/3 *:leading-8 text-justify'>
              Get inspired every day with motivational quotes and tips to keep
              you on track.
            </p>
          </div>
          <Image
            src={"/landing/daily-motivation.png"}
            alt='Daily Motivation'
            className='w-1/2 object-cover aspect-[1.5/1] rounded-lg'
            width={1000}
            height={1000}
          />
        </LandingGridItem>
        <LandingGridItem className='w-full flex not-only-of-type:items-center justify-between'>
          <div className='flex flex-col gap-3 h-full justify-evenly'>
            <h2 className='text-7xl font-bold'>Set Your Goal</h2>
            <p className='text-gray-600 dark:text-gray-400 text-2xl max-w-2/3 *:leading-8 text-justify'>
              Turn fuzzy ambitions into a crystal‑clear target. Coachino helps
              you carve out measurable milestones and lays down the first
              actionable step right away.
            </p>
          </div>
          <Image
            src={"/landing/set-your-goal.png"}
            alt='Daily Motivation'
            className='w-1/2 object-cover aspect-[1.5/1] rounded-lg'
            width={1000}
            height={1000}
          />
        </LandingGridItem>
        <LandingGridItem className='w-full flex not-only-of-type:items-center justify-between'>
          <div className='flex flex-col gap-3 h-full justify-evenly'>
            <h2 className='text-7xl font-bold'>Track Your Progress</h2>
            <p className='text-gray-600 dark:text-gray-400 text-2xl max-w-2/3 *:leading-8 text-justify'>
              Watch your streaks grow, milestones light up, and trends shift in
              real time. Visual feedback keeps you honest, focused, and excited
              to push further.
            </p>
          </div>
          <Image
            src={"/landing/track-progress.png"}
            alt='Daily Motivation'
            className='w-1/2 object-cover aspect-[1.5/1] rounded-lg'
            width={1000}
            height={1000}
          />
        </LandingGridItem>
      </div>
    </div>
  );
}
