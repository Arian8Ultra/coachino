import React from "react";
import background from "@/assets/blurry-gradient-haikei (2).svg";
import CoachinoText from "@/assets/CoachinoText.svg";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import * as motion from "motion/react-client";
const NewHomeHero = () => {
  return (
    <motion.div
      className='relative min-h-screen rounded-br-[100px] overflow-hidden md:mt-0 -mt-20'
      initial={{
        opacity: 0,
      }}
      whileInView={{
        opacity: 1,
      }}
      transition={{
        duration: 0.3,
      }}
    >
      <Image
        src={background}
        alt='Background'
        layout='fill'
        objectFit='cover'
        className='-z-10'
      />
      <div className='relative z-10 pt-28 flex flex-col items-center justify-center text-center px-10 h-full'>
        <Image
          src={CoachinoText}
          alt='Coachino'
          width={500}
          height={100}
          className='w-11/12'
        />
        <motion.div
          className='flex justify-between w-full mt-10 px-5 md:flex-row flex-col gap-10 md:gap-0 items-center'
          initial={{
            opacity: 0,
            y: 50,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.5,
            delay: 0.3,
          }}
        >
          <h3 className='text-3xl font-semibold text-white'>شروعی‌ نو؛ با کوچینو!</h3>
          <div className='flex flex-col gap-3'>
            <h3 className='text-3xl font-semibold text-white'>تو معمولی نیستی</h3>
            <Link href={"/panel"}>
              <Button
                variant={"default"}
                className='text-white text-xl p-6 shadow-2xl shadow-primary'
              >
                ثابتش کن
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
      <Image
        src={"/landing/Coachino Base 2.webp"}
        alt='coachino'
        width={1000}
        height={1000}
        className='h-1/2 md:h-10/12 absolute bottom-0 z-10 object-cover mask-t-from-90% right-1/2 w-fit translate-x-1/2 '
      />
    </motion.div>
  );
};

export default NewHomeHero;
