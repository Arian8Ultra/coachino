import GlassBall from "@/components/layout/GlassBall";
import { Button } from "@/components/ui/button";
import {  MessageSquare } from "lucide-react";
import * as motion from "motion/react-client";
import Image from "next/image";
import Link from "next/link";

const NewHomeHeader = () => {
  return (
    <motion.div
      className='flex flex-col gap-2 items-center justify-center'
      initial={{ opacity: 0, y: 0 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
    >
      <div className='flex flex-col gap-5 items-center'>
        <motion.h1 className='text-5xl text-center font-black leading-20'>
          یه <span className='text-accent'>کــــوچ</span> داری که <br /> همیشه
          پایه‌ست!
        </motion.h1>
        <motion.p className='leading-8'>
          هر وقت خواستی حرف بزن، مسیرت رو مرور کن یا فقط یه مشورت بخوای <br />
          یه همراه داری که می‌فهمت، کمک می‌کنه تصمیم‌هات رو قشنگ‌تر ببینی.
        </motion.p>
        <Link href='/panel'>
          <Button className='w-fit flex gap-3 p-8'>
            <MessageSquare />
            همین الان شروع کن
          </Button>
        </Link>
      </div>
      <div className='grid md:grid-cols-2 md:gap-10 w-full'>
        <div className='relative '>
          <Image
            src={"/landing/AvatarBlue.webp"}
            alt='AvatarBlue'
            width={1000}
            height={1000}
            className='w-full'
          />
          <GlassBall className='absolute end-16 top-1/3 rotate-12'>
            👨‍🎓
          </GlassBall>
        </div>
        <div className='relative'>
          <Image
            src={"/landing/AvatarRose.webp"}
            alt='AvatarBlue'
            width={1000}
            height={1000}
            className='w-full'
          />
          <GlassBall className='absolute start-16 top-1/2 rotate-12'>
            👨‍🎓
          </GlassBall>
        </div>
      </div>
    </motion.div>
  );
};

export default NewHomeHeader;
