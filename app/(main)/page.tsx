import HomeCapsule from "@/components/main/Capsule/HomeCapsule";
import HomeCarousel from "@/components/main/Carousel/HomeCarousel";
import HomeHeader from "@/components/main/header/HomeHeader";
import HomeStartNow from "@/components/main/StartNow/HomeStartNow";

export default function Page() {
  return (
    <div className='flex flex-col gap-20 p-5 md:p-20 snap-always snap-y snap-mandatory'>
      {/* <LandingSlider className='max-h-[80dvh] md:max-h-max' /> */}
      <HomeHeader />
      <HomeCapsule />
      <HomeCarousel />
      <HomeStartNow />
    </div>
  );
}
