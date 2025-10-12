import * as motion from "motion/react-client";
import Image from "next/image";

const NewWhyCoachino = () => {
  return (
    <motion.div
      className='flex flex-col gap-10 w-full md:px-20 px-10'
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
    >
      {/* <div className='flex gap-2 items-center'>
        <GlassBall className='bg-primary h-fit'>
          <CircleQuestionMark className='text-accent-foreground' />
        </GlassBall>
        <h3>چرا کوچینو؟</h3>
      </div> */}

      {/* <div className='flex md:flex-row flex-col justify-between gap-10'>
        <div className='flex flex-col gap-5'>
          <div className='flex gap-2 items-center'>
            <GlassBall className='bg-primary h-fit'>
              <CircleQuestionMark className='text-accent-foreground' />
            </GlassBall>
            <h3 className='font-semibold text-2xl'>چرا کوچینو؟</h3>
          </div>

          <p className='text-xl leading-10 max-w-2xl text-justify'>
            این زندگی یه جاده‌ست پر از پیچ و خم، ولی وقتی خودت رو بشناسی،
            می‌تونی کل مسیر رو حتی با چشم بسته تا رسیدن به اون چیزی که می‌خوای
            بدوی. کوچینو شما رو به این سفر دعوت می‌کنه. این مسیر با پیدا کردن
            خودت شروع می‌شه و تهش به همون‌جایی می‌رسی که از بچگی تو دل و ذهنت
            بود. می‌دونم شاید الان رویای بچگیتو فراموش کردی، ولی نگران نباش!
            قراره همه‌چی یادت بیاد.
          </p>
        </div>


      </div> */}

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

export default NewWhyCoachino;
