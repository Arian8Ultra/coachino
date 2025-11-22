import CoachinoText from "@/assets/CoachinoText.svg";
import { SparklesCore } from "@/components/ui/sparkles";
import * as motion from "motion/react-client";
import Image from "next/image";
const NewHomeHero = () => {
  return (

    <motion.div
      className='w-full flex flex-col items-center justify-center md:justify-end  rounded-md h-screen relative overflow-visible '
      initial={{
        opacity: 0,
      }}
      whileInView={{
        opacity: 1,
      }}
      transition={{
        duration: 0.5,
      }}
    >
      <Image
        src={CoachinoText}
        alt='Coachino'
        width={500}
        height={100}
        className='md:w-2/3 w-11/12 opacity-95 mask-l from-0% mask-l-to-100% invert dark:invert-0'
      />

      <Image
        src={"/landing/Coachino Base 2.webp"}
        alt='coachino'
        width={1000}
        height={1000}
        className='h-auto md:h-2/3 w-11/12 md:w-auto z-10 object-cover mask-t-from-90% right-1/2 md:-mt-[40dvh] dark:brightness-85 -mb-0.5'
      />
      
      <div className='w-full md:w-3/4 h-30 relative flex flex-col items-center justify-center z-20 overflow-visible'>


        {/* Core component */}
        <SparklesCore
          background='transparent'
          minSize={0.4}
          maxSize={1}
          particleDensity={1200}
          className='w-3/4 h-full mask-radial-at-bottom mask-radial-from-90% mask-radial-to-0% mask-x-from-70% mask-x-to-100% mask-b-from-30% mask-b-to-100% dark:invert-0 invert'
          particleColor='#FFFFFF'
        />
        <motion.div
          className='absolute top-0 w-[120%] aspect-square bg-linear-to-r from-accent to-primary blur-sm translate-x-1/2 start-1/2 transform -translate-y-1/2 mask-radial-at-center mask-radial-from-0% mask-radial-to-50%  -z-10 md:block hidden'
          initial={{ width: "20px", opacity: 0 }}
          animate={{ width: "120%", opacity: 0.2 }}
          whileInView={{ width: "120%", opacity: 0.2 }}
          transition={{ duration: 1, delay: 0.4 }}
        />
        <motion.div
          className='absolute top-0  h-[5px] rounded-full bg-linear-to-r from-accent to-primary  translate-x-1/2 start-1/2 mask-radial-at-center mask-radial-from-0% mask-radial-to-100%'
          initial={{ width: "20px" }}
          animate={{ width: "75%" }}
          whileInView={{ width: "75%" }}
          transition={{ duration: 0.8 }}
        />
        <motion.div
          className='absolute top-0 w-2/3 h-48 bg-linear-to-r from-accent to-primary blur-sm translate-x-1/2 start-1/2 transform -translate-y-1/2 mask-radial-at-center mask-radial-from-0% mask-radial-to-70%  mask-t-from-50% mask-t-to-50%
          '
          initial={{ width: "20px", opacity: 0 }}
          animate={{ width: "66.66%", opacity: 0.5 }}
          whileInView={{ width: "66.66%", opacity: 0.5 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        />
        {/* Radial Gradient to prevent sharp edges */}
        <div className='absolute inset-0 w-full h-full bg-transparent mask-[radial-gradient(at_top,transparent_20%,white)] '></div>
      </div>
    </motion.div>
  );
};

export default NewHomeHero;
