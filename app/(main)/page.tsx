import Footer from "@/components/layout/Landing/Footer/Footer";
import HomeAboutUs from "@/components/main/home/HomeAboutUs";
import HomeStats from "@/components/main/home/HomeStats";
import NewHomeHeader from "@/components/main/home/NewHomeHeader";

export default function Page() {
  return (
    <div className='flex flex-col gap-10 '>
      {/* <LandingSlider className='max-h-[80dvh] md:max-h-max' /> */}
      <NewHomeHeader />
      <HomeStats />
      <HomeAboutUs/>
      <Footer/>
    </div>
  );
}
