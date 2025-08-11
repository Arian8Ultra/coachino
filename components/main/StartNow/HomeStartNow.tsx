"use client";
import { Button } from "@/components/ui/button";
import { MoveLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const HomeStartNow = () => {
  const h3 = "منتظر چی هستی؟";
  const p = "هدف و آرزوی خودت رو به کوچینو بسپار و به راحتی بهشون برس.";
  const buttonText = "شروع کن";
  const buttonLink = "/start";
  return (
    <div className='flex flex-col w-full rounded-full p-8 gap-10 relative shadow-[0px_10px_198px_23px] shadow-accent/50'>
      <Image
        src={"/landing/header/02.jpg"}
        alt='Start Now'
        className='object-cover absolute inset-0 w-full h-full rounded-full  opacity-50 brightness-70 saturate-[70%]'
        fill
      />
      <div className='flex flex-col items-center justify-center gap-5 relative z-10'>
        <h3 className='text-3xl md:text-5xl font-bold p-1 text-center'>{h3}</h3>
        <p className='text-lg md:text-xl text-gray-700 dark:text-gray-300 text-center'>
          {p}
        </p>
        <Link href={buttonLink}>
          <Button
            variant='gradientGlass'
            className='w-fit px-5 text-2xl py-7 rounded-full'
          >
            {buttonText}
            <MoveLeft className='ml-2 h-6 w-6' />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default HomeStartNow;
