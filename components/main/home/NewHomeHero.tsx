import CoachinoText from "@/assets/CoachinoText.svg";
import { SparklesCore } from "@/components/ui/sparkles";
import * as motion from "motion/react-client";
import Image from "next/image";
const NewHomeHero = () => {
  return (
    // <motion.div
    //   className='relative min-h-screen rounded-br-[100px] overflow-hidden md:mt-0 -mt-20 group'
    //   initial={{
    //     opacity: 0,
    //   }}
    //   whileInView={{
    //     opacity: 1,
    //   }}
    //   transition={{
    //     duration: 0.3,
    //   }}
    // >
    //   <Image
    //     src={background}
    //     alt='Background'
    //     layout='fill'
    //     objectFit='cover'
    //     className='-z-10'
    //   />
    //   <div className='relative z-10 pt-28 flex flex-col items-center justify-center text-center px-10 h-full'>
    //     <Image
    //       src={CoachinoText}
    //       alt='Coachino'
    //       width={500}
    //       height={100}
    //       className='w-11/12 invert opacity-95'
    //     />
    //     <motion.div
    //       className='flex justify-between w-full md:mt-20 mt-10 px-5 md:flex-row flex-col gap-10 md:gap-0 items-start md:w-4/5'
    //       initial={{
    //         opacity: 0,
    //         y: 50,
    //       }}
    //       whileInView={{
    //         opacity: 1,
    //         y: 0,
    //       }}
    //       transition={{
    //         duration: 0.5,
    //         delay: 0.3,
    //       }}
    //     >
    //       {/* <div className=""></div> */}
    //       <div className='flex flex-col gap-3'>
    //         <h3 className='text-4xl font-semibold text-white'>
    //           تو معمولی نیستی
    //         </h3>
    //         <Link href={"/panel"}>
    //           <Button
    //             variant={"default"}
    //             className='text-white text-3xl p-8 shadow-lg shadow-primary mt-5 z-50 hover:shadow-2xl'
    //           >
    //             ثابتش کن
    //           </Button>
    //         </Link>
    //       </div>
    //     </motion.div>
    //   </div>
    //   <Image
    //     src={"/landing/Coachino Base 2.webp"}
    //     alt='coachino'
    //     width={1000}
    //     height={1000}
    //     className='h-1/2 md:h-10/12 absolute bottom-0 z-10 object-cover mask-t-from-90% right-1/2 w-fit translate-x-1/2 '
    //   />
    // </motion.div>
    <motion.div
      className='w-full flex flex-col items-center justify-center overflow-hidden rounded-md h-screen relative'
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
        className='w-2/3 opacity-95 mask-l from-0% mask-l-to-100%'
      />
      {/* <h1>
        <span className='text-5xl md:text-7xl font-extrabold bg-gradient-to-r from-accent via-primary to-accent bg-clip-text text-transparent'>
          کوچینو
        </span>
      </h1> */}

      {/* <Image
        src={"/landing/Coachino Base 2.webp"}
        alt='coachino'
        width={1000}
        height={1000}
        className='h-1/2 md:h-10/12 absolute bottom-0 z-10 object-cover mask-t-from-90% right-1/2 w-fit translate-x-1/2 '
      /> */}
      <Image
        src={"/landing/Coachino Base 2.webp"}
        alt='coachino'
        width={1000}
        height={1000}
        className='h-2/3 md:h-2/3 z-10 object-cover mask-t-from-90% right-1/2 w-auto -mt-[40dvh] brightness-90 '
      />
      <div className='w-3/4 h-30 relative flex flex-col items-center justify-center z-20'>
        {/* Gradients */}
        {/* <div className='absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-[2px] w-3/4 blur-sm' />
        <div className='absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-px w-3/4' />
        <div className='absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-[5px] w-1/4 blur-sm' />
        <div className='absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-px w-1/4' /> */}

        {/* Core component */}
        <SparklesCore
          background='transparent'
          minSize={0.4}
          maxSize={1}
          particleDensity={1200}
          className='w-3/4 h-full mask-radial-at-bottom mask-radial-from-90% mask-radial-to-0% mask-x-from-90% mask-x-to-100%'
          particleColor='#FFFFFF'
        />
        <div className='absolute top-0 w-3/4 h-[3px] bg-gradient-to-r from-accent to-primary  translate-x-1/2 start-1/2 mask-radial-at-center mask-radial-from-0% mask-radial-to-100%' />
        <div className='absolute top-0 w-2/3 h-32 bg-gradient-to-r from-accent to-primary blur-sm translate-x-1/2 start-1/2 -translate-y-1/2 mask-radial-at-center mask-radial-from-0% mask-radial-to-60%' />
        {/* Radial Gradient to prevent sharp edges */}
        <div className='absolute inset-0 w-full h-full bg-background [mask-image:radial-gradient(at_top,transparent_20%,white)]'></div>
      </div>
    </motion.div>
  );
};

export default NewHomeHero;
