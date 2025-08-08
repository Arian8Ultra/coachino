import LandingTovNav from "@/components/layout/Landing/LandingTopNav/LandingTovNav";
import Image from "next/image";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <section className='relative max-w-screen'>
      <Image
        src={"/backgrounds/blurgradient.svg"}
        alt='Page Top Background'
        className='fixed top-0 left-0 w-full h-screen object-cover opacity-30 brightness-100 dark:brightness-100 -z-10'
        width={1920}
        height={1080}
      />
      <LandingTovNav />

      {children}
    </section>
  );
}
