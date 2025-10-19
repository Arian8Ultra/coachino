import background from "@/assets/blurry-gradient-haikei (2).svg";
import GlassBall from "@/components/layout/GlassBall";
import { Button } from "@/components/ui/button";
import { Play, Sparkles } from "lucide-react";
import * as motion from "motion/react-client";
import Image from "next/image";
import Link from "next/link";
const HomeCTOCard = () => {
  return (
    <motion.div
      className='flex w-2/3 mx-auto h-fit relative p-16 justify-between items-center md:flex-row flex-col gap-10'
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
    >
      <Image
        src={background}
        fill
        quality={100}
        alt='background'
        className='w-full h-full object-cover rounded-3xl -z-10'
      />
      <GlassBall className='bg-primary/40  absolute end-0 top-0 -translate-y-1/2 -translate-x-1/2'>
        <Play className='text-accent-foreground' />
      </GlassBall>
      <GlassBall className='bg-primary/40  absolute start-0 bottom-0 translate-y-1/2 translate-x-1/2'>
        <Sparkles className='text-accent-foreground fill-accent-foreground stroke-0' />
      </GlassBall>
      <h3 className='text-2xl font-black text-center text-accent-foreground leading-10'>
        این ماموریت خاص رو از همین لحظه شروع کن!
      </h3>
      <Link href='/signup' className='self-center'>
        <Button
          size={"lg"}
          className='p-8 text-accent-foreground relative shadow-2xl shadow-primary'
        >
          {/* <GlassBall className='bg-primary/40  absolute start-0 bottom-1/2 translate-y-1/2 translate-x-1/2'>
            <Sparkle className='text-accent-foreground fill-accent-foreground stroke-0' />
          </GlassBall> */}
          یه کلیک، یه زندگی جدید!
        </Button>
      </Link>
    </motion.div>
  );
};

export default HomeCTOCard;
