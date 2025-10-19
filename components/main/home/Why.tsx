import React from "react";
import * as motion from "motion/react-client";
import Image from "next/image";
import {
  GlobeIcon,
  Handshake,
  HatGlasses,
  Languages,
  Sparkle,
  Wrench,
} from "lucide-react";

const Why = () => {
  return (
    <motion.div
      className='gap-2 grid md:grid-cols-2 relative bg-glass/60 backdrop-blur-lg my-10'
      initial={{ opacity: 0, y: 0 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
    >
      <Image
        src={"/landing/tasks.webp"}
        width={1000}
        height={1000}
        alt='conversation'
        className='w-full'
      />
      <div className='flex flex-col gap-10 p-10 h-full '>
        <h2 className='text-3xl font-bold'>
          چرا <span className='text-accent'>کوچینو</span>؟
        </h2>
        <div className='h-fit my-auto flex flex-col gap-5'>
          <div className='flex gap-2 p-1'>
            <Sparkle className='stroke-0 fill-accent' />
            <p>
              <span className='font-semibold'>شخصی‌سازی عمیق</span>
              همه‌چیز بر اساس MBTI، اهداف و رفتار واقعی تو تنظیم می‌شود.
            </p>
          </div>

          <div className='flex gap-2 p-1'>
            <Wrench className='stroke-0 fill-accent' />
            <p>
              <span className='font-semibold'>تمرکز بر عمل‌گرایی: </span>{" "}
              تسک‌های کوچک، واضح و قابل انجام—بدون پیچیدگیِ اضافی.{" "}
            </p>
          </div>
          <div className='flex gap-2 p-1'>
            <GlobeIcon className='text-accent' />
            <p>
              <span className='font-semibold'>منابع معتبرِ دست‌چین‌شده: </span>{" "}
              برای هر هدف، بهترین مسیر یادگیری را پیشنهاد می‌کنیم.{" "}
            </p>
          </div>
          <div className='flex gap-2 p-1'>
            <Handshake className='text-accent' />
            <p>
              <span className='font-semibold'>همراه همیشه‌در‌دسترس: </span>{" "}
              مربی‌ای که خسته نمی‌شود و به‌وقتِ نیاز یادت می‌آورد.
            </p>
          </div>
          <div className='flex gap-2 p-1'>
            <Languages className='text-accent' />
            <p>
              <span className='font-semibold'>کاملا فارسی و بومی: </span>{" "}
              مثال‌ها، سناریوها و پیشنهادها با فرهنگ و نیازهای ما سازگارند.
            </p>
          </div>
          <div className='flex gap-2 p-1'>
            <HatGlasses className='text-accent fill-accent' />
            <p>
              <span className='font-semibold'>حریم خصوصی مهم است: </span>{" "}
              داده‌های تو امن‌اند و فقط برای بهبود تجربه‌ی خودت استفاده می‌شوند.{" "}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Why;
