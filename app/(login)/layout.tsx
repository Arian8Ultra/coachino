import Logo from "@/assets/CoachinoWithText.svg";
import { IsAuthenticated } from "@/auth/AuthFunctions";
import Image from "next/image";
import { redirect } from "next/navigation";

export default async function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Delay for 2 seconds before authenticating
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const user = await IsAuthenticated();

  if (user) {
    redirect("/panel");
  }

  return (
    <section className=''>
      <div className='grid md:grid-cols-2 w-full min-h-dvh relative'>
        {/* <Image
          src={background}
          alt='Nexiino Background'
          width={200}
          height={200}
          className='absolute top-0 left-0 w-full h-full object-cover dark:block hidden'
        />
        <ClientImage
          src={backgroundW}
          alt='Nexiino Background'
          width={200}
          height={200}
          className='absolute top-0 left-0 w-full h-full object-cover  dark:hidden block'
        /> */}
        <div className='absolute top-0 left-0 w-full h-full bg-radial-[at_70%_75%] from-primary to-transparent pointer-events-none' />

        <div className='absolute top-0 left-0 w-full h-full bg-radial-[at_30%_0%] from-accent to-transparent pointer-events-none' />

        <div className='w-full items-center justify-center gap-5 flex-col md:p-20 hidden p-10 relative md:flex'>
          {/* <Image
            src={Logo}
            alt='Nexiino Logo'
            width={800}
            height={200}
            className='dark:brightness-0 brightness-200 w-full'
          /> */}
          <div className='flex gap-5 items-center me-8 absolute -translate-y-1/2 top-1/2 '>
            <Image
              src={Logo}
              alt='Coachino Logo'
              width={1000}
              height={1000}
              className='w-[30dvw]'
            />
            {/* <span className='text-5xl font-semibold'>کوچینو</span> */}
          </div>
        </div>
        <div className='md:p-10 md:hidden flex items-center justify-center gap-5 flex-col relative'>
          <div className='flex gap-5 items-center me-8'>
            <Image
              src={Logo}
              alt='Coachino Logo'
              width={1000}
              height={1000}
              className='w-[60dvw]'
            />
          </div>
        </div>
        {children}
      </div>
    </section>
  );
}
