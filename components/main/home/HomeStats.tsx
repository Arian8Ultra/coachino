import React from "react";
import * as motion from "motion/react-client";
import Image from "next/image";
import {
  Briefcase,
  CircleQuestionMark,
  Presentation,
  Smile,
  TrendingUp,
  Wifi,
} from "lucide-react";

const HomeStats = () => {
  return (
    <motion.div
      className='grid grid-cols-4 md:grid-cols-6 gap-5 items-center justify-center relative'
      initial={{ opacity: 0, y: 0 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
    >
      <div className='flex col-span-full md:col-span-2 flex-col gap-10 '>
        <div className='flex gap-4 '>
          <Image
            src={"/landing/ZigZagBlue.svg"}
            width={100}
            height={100}
            alt='zzb'
            className='md:block'
          />
          <div className='flex flex-col gap-5 p-5'>
            <h3 className='flex gap-4 font-bold text-xl items-center'>
              <TrendingUp className='w-4 h-4 text-primary' />
              قدم‌به‌قدم کنار کوچینو
            </h3>
            <p className='leading-8 text-muted-foreground text-justify'>
              هر تعامل، یه تجربه واقعی از رشد، آگاهی و آرامشه.و این عددها فقط
              نشون می‌دن چقدر با هم پیش رفتیم.
            </p>
          </div>
        </div>

        <div className='flex flex-col gap-5 md:p-16 p-5'>
          <h3 className='flex gap-4 font-bold text-xl items-center'>
            <CircleQuestionMark className='w-4 h-4 text-primary' />
            چرا کوچینو ؟
          </h3>
          <p className='leading-8 text-muted-foreground text-justify'>
            این زندگی یه جاده‌ست پر از پیچ و خم، ولی وقتی خودت رو بشناسی،
            می‌تونی کل مسیر رو حتی با چشم بسته تا رسیدن به اون چیزی که می‌خوای
            بدوی. کوچینو شما رو به این سفر دعوت می‌کنه. این مسیر با پیدا کردن
            خودت شروع می‌شه و تهش به همون‌جایی می‌رسی که از بچگی تو دل و ذهنت
            بود. می‌دونم شاید الان رویای بچگیتو فراموش کردی، ولی نگران نباش!
            قراره همه‌چی یادت بیاد.
          </p>
        </div>
      </div>

      <div className='flex justify-evenly gap-5 p-10 my-auto md:col-span-4 col-span-full flex-wrap relative'>
        <div className='p-4 rounded-lg border w-fit h-fit backdrop-blur-md'>
          <Presentation className='mb-8' />
          <p className='text-muted-foreground my-2'>تعداد کوچینگ</p>
          <p className='text-accent font-bold text-center'>+۱۸۹۰ نفر</p>
        </div>

        <div className='p-4 rounded-lg border w-fit mt-10 h-fit backdrop-blur-md'>
          <Smile className='mb-8' />
          <p className='text-muted-foreground my-2'>رضایت کاربران</p>

          <p className='text-accent font-bold text-center'>۹۶٪ رضایت</p>
        </div>

        <div className='p-4 rounded-lg border w-fit mt-20 h-fit backdrop-blur-md'>
          <Briefcase className='mb-8' />
          <p className='text-muted-foreground my-2'>مشتریان سازمانی</p>
          <p className='text-accent font-bold text-center'>۱۳ نفر</p>
        </div>

        <div className='p-4 rounded-lg border w-fit mt-32 h-fit backdrop-blur-md'>
          <Wifi className='mb-8' />
          <p className='text-muted-foreground my-2'>کاربران فعال</p>
          <p className='text-accent font-bold text-center'>+۲۷۰ نفر</p>
        </div>

        <Image
          src={"/landing/ZigZagRose.svg"}
          width={100}
          height={100}
          alt='zzr'
          className='md:block absolute end-0 bottom-0 -z-10'
        />
      </div>
      <div className='col-span-full w-full p-10 pt-0'>
        <Image
          src={"/landing/RoadMap.webp"}
          width={3000}
          height={3000}
          quality={100}
          alt='RoadMap'
          className='md:block w-full'
        />
      </div>
    </motion.div>
  );
};

export default HomeStats;
