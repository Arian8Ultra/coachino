import GlassBall from "@/components/layout/GlassBall";
import { Briefcase, ChartArea,  Presentation, Smile, UsersRound } from "lucide-react";
import * as motion from "motion/react-client";

const NewHomeStats = () => {
  return (
    <motion.div
      className='flex flex-col gap-10 w-full md:px-20 px-10'
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
    >
      <div className='flex gap-4'>
        <GlassBall className='bg-primary h-fit'>
          <ChartArea className='text-accent-foreground' />
        </GlassBall>
        <p className='text-xl text-start leading-14'>
          یه رازی بهت بگم؟
          <br />
          رویای تو فقط یه تصمیم باهات فاصله داره؛
          <br />
          <span className='font-bold text-2xl'>
            یه شروع متفاوت، با کوچ هوشمند!
          </span>
        </p>
      </div>

      <motion.div
        className='grid md:grid-cols-4 grid-cols-2 gap-10 md:gap-20 w-full'
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
      >
        <div
          className='p-4 rounded-lg h-full w-full bg-[#FB6D9D] shadow-2xl shadow-[#FB6D9D]
        text-accent-foreground relative'
        >
          <GlassBall className='bg-[#FB6D9D]/10 h-fit w-fit absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 -mb-5'>
            <Presentation className='text-accent-foreground' />
          </GlassBall>
          {/* <Presentation className='mb-8' /> */}
          <p className='my-2 text-center mt-5 text-2xl font-semibold'>
            تعداد کوچینگ
          </p>
          <p className='font-black text-center text-xl'>
            +۱۸۹۰
            <span className='text-xs mr-1'>نفر</span>
          </p>
        </div>

        <div
          className='p-4 rounded-lg h-full w-full bg-[#9F8BFA] shadow-2xl shadow-[#9F8BFA]
        text-accent-foreground relative'
        >
          <GlassBall className='bg-[#9F8BFA]/10 h-fit w-fit absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 -mb-5'>
            <Smile className='text-accent-foreground' />
          </GlassBall>
          <p className='my-2 text-center mt-5 text-2xl font-semibold'>
            رضایت کاربران
          </p>
          <p className='font-black text-center text-xl'>
            ۹۶٪ <span className='text-xs mr-1'>رضایت</span>
          </p>
        </div>

        <div
          className='p-4 rounded-lg h-full w-full bg-[#2196F3] shadow-2xl shadow-[#2196F3]
        text-accent-foreground relative'
        >
          <GlassBall className='bg-[#2196F3]/10 h-fit w-fit absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 -mb-5'>
            <Briefcase className='text-accent-foreground' />
          </GlassBall>
          <p className='my-2 text-center mt-5 text-2xl font-semibold'>
            مشتریان سازمانی
          </p>
          <p className='font-black text-center text-xl'>
            ۱۳ <span className='text-xs mr-1'>نفر</span>
          </p>
        </div>
        <div
          className='p-4 rounded-lg h-full  w-full bg-[#ffac4d] shadow-2xl shadow-[#ffac4d]
        text-accent-foreground relative'
        >
          <GlassBall className='bg-[#ffac4d]/10 h-fit w-fit absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 -mb-5'>
            <UsersRound className='text-accent-foreground' />
          </GlassBall>
          <p className='my-2 text-center mt-5 text-2xl font-semibold'>
            کاربران فعال
          </p>
          <p className='font-black text-center text-xl'>
            +۲۷۰ <span className='text-xs mr-1'>نفر</span>
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default NewHomeStats;
