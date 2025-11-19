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
        className='h-auto md:h-2/3 w-11/12 md:w-auto z-10 object-cover mask-t-from-90% right-1/2 md:-mt-[40dvh] dark:brightness-[85%] -mb-[2px]'
      />
      
      <div className='w-full md:w-3/4 h-30 relative flex flex-col items-center justify-center z-20 overflow-visible'>
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
          className='w-3/4 h-full mask-radial-at-bottom mask-radial-from-90% mask-radial-to-0% mask-x-from-70% mask-x-to-100% mask-b-from-30% mask-b-to-100% dark:invert-0 invert'
          particleColor='#FFFFFF'
        />
        <motion.div
          className='absolute top-0 w-[120%] aspect-square bg-gradient-to-r from-accent to-primary blur-sm translate-x-1/2 start-1/2 transform -translate-y-1/2 mask-radial-at-center mask-radial-from-0% mask-radial-to-50%  -z-10 md:block hidden'
          initial={{ width: "20px", opacity: 0 }}
          animate={{ width: "120%", opacity: 0.2 }}
          whileInView={{ width: "120%", opacity: 0.2 }}
          transition={{ duration: 1, delay: 0.4 }}
        />
        <motion.div
          className='absolute top-0  h-[5px] rounded-full bg-gradient-to-r from-accent to-primary  translate-x-1/2 start-1/2 mask-radial-at-center mask-radial-from-0% mask-radial-to-100%'
          initial={{ width: "20px" }}
          animate={{ width: "75%" }}
          whileInView={{ width: "75%" }}
          transition={{ duration: 0.8 }}
        />
        <motion.div
          className='absolute top-0 w-2/3 h-48 bg-gradient-to-r from-accent to-primary blur-sm translate-x-1/2 start-1/2 transform -translate-y-1/2 mask-radial-at-center mask-radial-from-0% mask-radial-to-70%  mask-t-from-50% mask-t-to-50%
          '
          initial={{ width: "20px", opacity: 0 }}
          animate={{ width: "66.66%", opacity: 0.5 }}
          whileInView={{ width: "66.66%", opacity: 0.5 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        />
        {/* Radial Gradient to prevent sharp edges */}
        <div className='absolute inset-0 w-full h-full bg-transparent [mask-image:radial-gradient(at_top,transparent_20%,white)] '></div>
      </div>
    </motion.div>
  );
};

export default NewHomeHero;
