import Footer from "@/components/layout/Landing/Footer/Footer";
import HomeAboutUs from "@/components/main/home/HomeAboutUs";
import HomeCTOCard from "@/components/main/home/HomeCTOCard";
import HomePlans from "@/components/main/home/HomePlans";
import NewHomeHero from "@/components/main/home/NewHomeHero";
import NewHomeStats from "@/components/main/home/NewHomeStats";
import NewWhyCoachino from "@/components/main/home/NewWhyCoachino";

export default function Page() {
  return (
    <div className='flex flex-col md:gap-20 gap-10 '>
      {/* <LandingSlider className='max-h-[80dvh] md:max-h-max' /> */}
      <NewHomeHero />
      <div className='flex flex-col gap-10 md:w-3/4 mx-auto'>
        <NewHomeStats />
        <NewWhyCoachino />
        <HomeCTOCard />
        {/* <NewHomeHeader /> */}
        {/* <HomeStats /> */}
        <HomePlans />
      <HomeAboutUs />
      </div>
      <Footer />
    </div>
  );
}
