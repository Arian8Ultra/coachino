import LandingTovNav from "@/components/layout/Landing/LandingTopNav/LandingTovNav";
import Image from "next/image";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <section className='relative'>
      <Image
        src={"/page-top.jpg"}
        alt='Page Top Background'
        className='absolute top-0 left-0 w-full h-[20dvh] object-cover opacity-20'
        width={1920}
        height={1080}
      />
      <LandingTovNav />
      
      {children}
    </section>
  );
}
