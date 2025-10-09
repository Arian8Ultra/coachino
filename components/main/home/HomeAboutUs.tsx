import React from "react";
import * as motion from "motion/react-client";
import Image from "next/image";
import { Hand } from "lucide-react";
const HomeAboutUs = () => {
  return (
    <motion.div
      className='grid grid-cols-4 md:grid-cols-5 gap-5 items-center justify-center relative'
      initial={{ opacity: 0, y: 0 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
    >
      {" "}
      <div className='col-span-full md:col-span-3 p-10 md:p-10 mt-auto'>
        <Image
          src={"/landing/AboutUs.webp"}
          width={3000}
          height={3000}
          quality={100}
          alt='RoadMap'
          className='md:block w-full'
        />
      </div>
      <div className='flex col-span-full md:col-span-2 flex-col gap-10 p-10'>
        <div className='flex flex-col gap-5 p-5'>
          <h3 className='flex gap-4 font-bold text-xl items-center'>
            <Hand className='w-4 h-4 text-primary' />
            درباره کوچینو{" "}
          </h3>
          <p className='leading-8 text-muted-foreground text-justify'>
            ما یه تیمیم که یه هدف ساده داریم؛ کمک کنیم خودت رو بهتر بشناسی،
            واضح‌تر ببینی و با اطمینان بیشتری مسیرت رو ادامه بدی. اینجا خبری از
            نصیحت و شعار نیست، فقط گفت‌وگوهای واقعی برای پیدا کردن خودت. کوچینو
            یه همراه همیشه در دسترسه تا هر وقت خواستی باهاش حرف بزنی، فکر کنی و
            به جواب‌هات برسی. کم‌کم یاد می‌گیری چی واقعاً برات مهمه، از چی فرار
            می‌کنی و دنبال چی بودی که یادت رفته. هر گفت‌وگو یه قدم به خود
            واقعی‌ت نزدیک‌ترت می‌کنه و همین قدم‌های کوچیک، بزرگ‌ترین تغییرها رو
            می‌سازن. کوچینو فقط یه پلتفرم نیست؛ یه رفیقه که کنارت می‌مونه تا
            مسیرت رو پیدا کنی و دوباره یادت بیاد از کجا شروع کردی.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default HomeAboutUs;
