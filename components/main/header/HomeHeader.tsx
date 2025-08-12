import { Button } from "@/components/ui/button";
import { MoveLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import CoachinoBody from "@/public/landing/header/CoachinoBody.webp"
// import motion
import * as motion from "motion/react-client";
const HomeHeader = () => {
  const h1 = "کوچینو";
  const title = "به سوی پیشرفت و موفقیت";
  const description =
    "با کوچینو به اهداف خود نزدیک‌تر شوید و در مسیر رشد و توسعه فردی گام بردارید.";
  const buttonText = "شروع کنید";
  const buttonLink = "/start"; // Adjust the link as needed
  return (
    <motion.div
      className='flex md:flex-row flex-col gap-2 items-start justify-start md:justify-between md:p-5 h-[80dvh] md:h-[70dvh] relative'
      initial={{ opacity: 0, y: 0 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
    >
      <div className='flex flex-col gap-6 items-start justify-start md:max-w-2/3 md:p-10 md:ms-20'>
        <h1 className='text-4xl md:text-6xl font-bold bg-gradient-to-l from-blue-600 to-accent bg-clip-text text-transparent p-1'>
          {h1}
        </h1>
        <h2 className='text-xl md:text-2xl font-semibold text-primary'>
          {title}
        </h2>
        <p className='text-base md:text-lg text-gray-700 dark:text-gray-300'>
          {description}
        </p>
        <Link href={buttonLink}>
          <Button
            variant='gradientGlass'
            className='w-fit md:px-5 md:text-2xl md:py-7'
          >
            {buttonText}
            <MoveLeft className='ml-2 h-4 w-4' />
          </Button>
        </Link>
      </div>



      <Image
        src={CoachinoBody}
        alt='Header Image'
        className='w-full md:w-3/5 object-contain aspect-[5/4.5] object-center absolute bottom-40 end-[30%] -translate-x-1/2 translate-y-1/2 md:block hidden'
        width={1000}
        height={1000}
        quality={100}
      />
      <Image
        src={CoachinoBody}
        alt='Header Image'
        className='w-full md:w-3/5 object-contain md:aspect-[5/4.5] object-center md:hidden  absolute bottom-10 end-1/2 -translate-x-1/2 translate-y-1/2'
        width={1000}
        height={1000}
        quality={100}
      />
      {/* <Image
        src={"/landing/header/Coachino Body.png"}
        alt='Header Image'
        className='w-full md:w-2/5 object-contain aspect-[5/4.5] object-left bg-gradient-to-br from-primary/50 to-accent/50 shadow-xl backdrop-blur-lg'
        style={{
          borderRadius: "5rem 5rem 30rem 5rem",
        }}
        width={1000}
        height={1000}
        quality={100}
      /> */}
      {/* <Image
        src={"/landing/header/blankSlider.png"}
        alt='Header Image'
        className='w-full md:w-2/5 object-cover aspect-[5/4.5] object-left shadow-xl contrast-125'
        style={{
            borderRadius: "5rem 5rem 30rem 5rem",
        }}
        width={1000}
        height={1000}
      /> */}
    </motion.div>
  );
};

export default HomeHeader;
