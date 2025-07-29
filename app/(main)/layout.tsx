import LandingTovNav from "@/components/layout/Landing/LandingTopNav/LandingTovNav";
import Image from "next/image";
import TopWave from "@/assets/SVG/TopWave.svg"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <section className='relative max-w-screen'>
      <Image
        src={TopWave}
        alt='Page Top Background'
        className='absolute top-0 left-0 w-full '
        width={1920}
        height={1080}
      />
      <LandingTovNav />
      
      {children}
    </section>
  );
}
