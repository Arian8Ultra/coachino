import { Button } from "@/components/ui/button";
import { MoveLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
// import motion 
import * as motion from "motion/react-client"
const HomeHeader = () => {
  const h1 = "کوچینو";
  const title = "به سوی پیشرفت و موفقیت";
  const description =
    "با کوچینو به اهداف خود نزدیک‌تر شوید و در مسیر رشد و توسعه فردی گام بردارید.";
  const buttonText = "شروع کنید";
  const buttonLink = "/start"; // Adjust the link as needed
  return (
    <motion.div className='flex md:flex-row flex-col-reverse gap-2 items-center justify-center md:justify-between p-5'
    initial={{ opacity: 0, y: 0 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.7 }}
    >
      <div className='flex flex-col gap-6 items-start justify-start md:max-w-1/2 p-5'>
        <h1 className='text-3xl md:text-5xl font-bold bg-gradient-to-l from-primary to-accent bg-clip-text text-transparent p-1'>
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
            className='w-fit px-5 text-2xl py-7 rounded-full'
          >
            {buttonText}
            <MoveLeft className='ml-2 h-4 w-4' />
          </Button>
        </Link>
      </div>
      
      <Image
        src={"/landing/header/blankSlider.png"}
        alt='Header Image'
        className='w-full md:w-1/2 object-cover aspect-[5/4.5] object-left shadow-xl'
        style={{
            borderRadius: "5rem 5rem 20rem 5rem",
        }}
        width={1000}
        height={1000}
      />
    </motion.div>
  );
};

export default HomeHeader;
