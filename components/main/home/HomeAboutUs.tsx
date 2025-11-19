import GlassBall from "@/components/layout/GlassBall";
import { Button } from "@/components/ui/button";
import { VerticalLamp } from "@/components/ui/lamp";
import { Book, Lock } from "lucide-react";
import * as motion from "motion/react-client";
import Image from "next/image";
import Link from "next/link";
const HomeAboutUs = () => {
  return (
    <motion.div
      className='flex flex-col gap-10 w-full md:px-20 px-10'
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
    >
      <div className='flex flex-col gap-6 '>
        <div className='flex gap-2 items-center'>
          <VerticalLamp
            color={"#4e78d6"}
            lampThickness='2.5px'
            className='gap-4 z-20 *:h-full! h-14'
          />
          <Book className='text-primary' />
          {/* <GlassBall className='bg-primary h-fit'>
          <Coins className='text-accent-foreground' />
        </GlassBall> */}
          <h3 className='text-2xl font-bold'>داستان کوچینو</h3>
        </div>

        <p className='text-xl text-justify leading-10'>
          سلام به همه کسانی که اینجا اومدن تا یکم بیشتر با کوچینو آشنا بشن. ما
          یک تیم بزرگ هستیم که باور داریم شانس وقتی معنا پیدا میکنه که در مسیر
          درستی باشی. کوچینو از دل شناخت واقعی تک تک آدما شکل گرفته نه از
          ایده‌های توخالی یا فرمول‌های آماده و پوچ. همه چیز از اونجایی شروع شد
          که ما به این فکر کردیم که چه کاری انجام بدیم تا راهی پیدا کنیم که به
          همه‌مون کمک کنه؟
          <br />
          شاید تو هم بعضی اوقات احساس می‌کنی پتانسیل‌های زیادی داری اما نمی‌دونی
          چطور ازشون استفاده کنی. کوچینو برای همین ساخته شده، برای کمک به کسایی
          که می‌خوان برای زندگیشون یه کار فوق‌العاده بکنن، یه کاری که 100 در 100
          نتیجه بده.
          <br />
          پس ما اومدیم و از آدما تست گرفتیم تا بهتر بشناسیمشون، بعد برنامه و
          تسک‌هایی رو برای هر شخصی بر اساس شناختی که ازش داشتیم تعریف کردیم و در
          مسیر هوشمند همراهیشون کردیم و{" "}
          <span className='text-accent font-semibold'>
            بوووووووووووووم! 💥
          </span>{" "}
          دیدیم تلاش ما جواب داد و تونستیم از این طریق ادمای زیادی رو به هدفاشون
          برسونیم.
          <br />
          هدفمون این نیست که فقط بهت یه برنامه بدیم؛ ما هر برنامه‌ای که
          می‌سازیم، برای هر شخص متفاوته؛ چون می‌دونیم همه ادما با هم فرق دارن.
          <br />
          حالا بهترین قسمتش چیه؟{" "}
          <span className='text-accent font-semibold'>
            کوچینو همیشه اینجاست!
          </span>{" "}
          یه همراه هوشمند که هر وقت دلت خواست، دلت گرفت، ناراحت بودی، حتی وقتی
          خوشحالی بتونی باهاش گپ بزنی. هر سوالی، هر دغدغه‌ای، هر چیزی که تو
          ذهنته، بپرس؛ کوچینو بر اساس همون شناختی که ازت داره، جوابتو میده.
          خیالت راحت!
        </p>
        <div className='flex gap-3 items-center justify-center '>
          <GlassBall className='bg-accent rotate-45 h-fit'>
            <Lock className='text-accent-foreground' />
          </GlassBall>
          <p className='text-accent font-black text-start text-xl'>
            هیچ انسانی به نتایج تستت یا حرفات دسترسی نداره.
          </p>
        </div>
        <p className='text-xl text-justify leading-10'>
          ما کوچینو رو خلق کردیم چون باور داریم داستان زندگی هر کسی منحصربه‌فرده
          و فقط کافیه یکی راه درست رو نشونش بده. کوچینو همون بهترین راهنما و
          رفیقته چون نه قضاوت می‌کنه، نه خسته می‌شه و همیشه بهترین راهکارا رو
          بهت میده. هر موقع آماده بودی، کوچینو کنارته. 
        </p>
      </div>
      <Link href='/signup' className='self-center mt-5'>
        <Button
          size={"lg"}
          className='p-8'
          variant={"outlineHalo"}
        >
          {/* <GlassBall className='bg-primary/40  absolute start-0 bottom-1/2 translate-y-1/2 translate-x-1/2'>
            <Sparkle className='text-accent-foreground fill-accent-foreground stroke-0' />
          </GlassBall> */}
          یه کلیک، یه زندگی جدید!
        </Button>
      </Link>
      <div className='col-span-full md:col-span-3 p-1 md:p-10 mt-auto'>
        <Image
          src={"/landing/AboutUs2.webp"}
          width={3000}
          height={3000}
          alt='RoadMap'
          className='md:block w-full md:-mb-32 -mb-10'
        />
      </div>
    </motion.div>
  );
};

export default HomeAboutUs;
