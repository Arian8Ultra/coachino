import LandingTovNav from "@/components/layout/Landing/LandingTopNav/LandingTovNav";
import Image from "next/image";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <section className='relative max-w-screen'>
      <video
        src={"/video/Comp 30.mp4"}
        autoPlay
        loop
        muted
        className='fixed top-0 left-0 w-full h-screen object-cover brightness-50 saturate-[70%] contrast-125 -z-10 opacity-80 invert dark:invert-0 '
      />
      <Image
        src={"/backgrounds/blurgradient.svg"}
        alt='Page Top Background'
        className='fixed top-0 left-0 w-full h-screen object-cover brightness-100 dark:brightness-100 dark:saturate-[55%] contrast-125 -z-10 opacity-20'
        width={1920}
        height={1080}
      />
      <LandingTovNav />
      <div className='relative'>{children}</div>
    </section>
  );
}
