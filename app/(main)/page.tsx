import HomeCapsule from "@/components/main/Capsule/HomeCapsule";
import HomeHeader from "@/components/main/home/HomeHeader";
import WhatIs from "@/components/main/home/WhatIs";
import Why from "@/components/main/home/Why";

export default function Page() {
  return (
    <div className='flex flex-col '>
      {/* <LandingSlider className='max-h-[80dvh] md:max-h-max' /> */}
      <HomeHeader />
      <HomeCapsule />
      <WhatIs />
      <Why />
      {/* <HomeCarousel />
      <HomeStartNow /> */}
    </div>
  );
}
