import { Button } from "@/components/ui/button";
import { MoveLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import * as motion from "motion/react-client";
const HomeHeader = () => {
  const h1 = "کوچینو";
  const title = "به سوی پیشرفت و موفقیت";
  const description =
    "با کوچینو به اهداف خود نزدیک‌تر شوید و در مسیر رشد و توسعه فردی گام بردارید.";
  const buttonText = "شروع کنید";
  const buttonLink = "/panel"; // Adjust the link as needed
  return (
    <motion.div
      className='flex md:flex-row flex-col gap-2 items-start justify-start md:justify-between h-screen relative !-mb-[10dvh]'
      initial={{ opacity: 0, y: 0 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
    >
      <Image
        alt='background'
        src={"/landing/HomeHeader.webp"}
        className='w-full h-full object-cover object-center absolute -z-10 -translate-x-1/2 left-1/2 brightness-[30%]'
        width={1000}
        height={1000}
        quality={100}
      />
      <div className='flex flex-col gap-6 items-start justify-start md:max-w-1/2 md:p-10 p-10 md:ms-20 !mt-20'>
        <h1 className='text-5xl md:text-6xl font-bold  text-white p-1'>{h1}</h1>
        <h2 className='text-3xl md:text-2xl font-semibold text-white'>
          {title}
        </h2>
        <p className='text-lg md:text-lg text-gray-300'>{description}</p>
        <Link href={buttonLink}>
          <Button variant='default' className='w-fit' size={"lg"}>
            {buttonText}
            <MoveLeft className='ms-2 h-4 w-4' />
          </Button>
        </Link>
      </div>
    </motion.div>
  );
};

export default HomeHeader;
