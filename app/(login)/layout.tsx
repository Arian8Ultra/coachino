import Image from "next/image";
import Logo from "@/public/Logo/Logo.svg";
import LogoB from "@/public/Logo/LogoB.svg";
import background from "@/assets/blurry-gradient-haikei.svg";
import backgroundW from "@/assets/blurry-gradient-haikeiW.svg";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookie = await cookies();
  const token = cookie.get("token")?.value;

  if( token) {
    redirect("/");
  }

  return (
    <section className=''>
      <div className='grid md:grid-cols-2 w-full min-h-dvh relative'>
        <Image
          src={background}
          alt='Nexiino Background'
          width={800}
          height={200}
          className='absolute top-0 left-0 w-full h-full object-cover opacity-20 md:hidden dark:block hidden'
        />
        <Image
          src={backgroundW}
          alt='Nexiino Background'
          width={800}
          height={200}
          className='absolute top-0 left-0 w-full h-full object-cover md:hidden dark:hidden block'
        />
        <div className='w-full md:dark:bg-stone-900 items-center justify-center gap-5 flex-col md:p-20 hidden p-10 relative md:flex'>
          <Image
            src={background}
            alt='Nexiino Background'
            width={800}
            height={200}
            className='absolute top-0 left-0 w-full h-full object-cover md:block hidden dark:block'
          />
          <Image
            src={backgroundW}
            alt='Nexiino Background'
            width={800}
            height={200}
            className='absolute top-0 left-0 w-full h-full object-cover md:block dark:hidden block'
          />
          <Image
            src={Logo}
            alt='Nexiino Logo'
            width={800}
            height={200}
            className='dark:brightness-0 brightness-200 w-full'
          />
        </div>
        <div className='p-10 md:hidden flex items-center justify-center gap-5 flex-col relative'>
          <Image
            src={LogoB}
            alt='Nexiino Logo'
            width={800}
            height={200}
            className='w-full dark:block hidden'
          />
          <Image
            src={Logo}
            alt='Nexiino Logo'
            width={800}
            height={200}
            className='dark:hidden block w-full'
          />
        </div>
        {children}
      </div>
    </section>
  );
}
