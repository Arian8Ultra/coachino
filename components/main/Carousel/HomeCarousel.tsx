"use client";
import * as motion from "motion/react-client";
import "swiper/css";
import { A11y, Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import HomeCarouselItem from "./HomeCarouselItem";

const HomeCarousel = () => {
  const items = [
    {
      // planner for sports
      imageSrc: "/landing/carousel/ChatGPT Image Aug 10, 2025, 04_43_23 PM.png",
      title: "برنامه‌ریز ورزشی",
      description:
        "برنامه‌ریزی ورزشی شخصی‌سازی شده برای رسیدن به اهداف تناسب اندام شما.",
    },
    {
      // planner for cooking and better cooking
      imageSrc: "/landing/carousel/ChatGPT Image Aug 10, 2025, 04_49_31 PM.png",
      title: "برنامه‌ریز آشپزی",
      description:
        "برنامه‌ریزی وعده‌های غذایی سالم و خوشمزه برای بهبود سبک زندگی شما.",
    },
    {
      // planner for finding a job and better job search
      imageSrc: "/landing/carousel/ChatGPT Image Aug 10, 2025, 06_02_14 PM.png",
      title: "برنامه‌ریز شغلی",
      description:
        "برنامه‌ریزی جستجوی شغلی و پیشنهادات شغلی متناسب با مهارت‌ها و علایق شما.",
    },
    {
      // planner for engineering and better engineering
      imageSrc: "/landing/carousel/ChatGPT Image Aug 10, 2025, 06_35_50 PM.png",
      title: "برنامه‌ریز مهندسی",
      description:
        "برنامه‌ریزی پروژه‌های مهندسی با استفاده از ابزارهای پیشرفته و هوش مصنوعی.",
    },
  ];
  return (
    <motion.div
      className='w-full h-full rounded-3xl'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className='text-3xl md:text-5xl font-bold my-10 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent text-center p-1'>
            چرا کوچینو؟
      </h3>
      <Swiper
        modules={[Autoplay, A11y]}
        className='w-full h-full'
        loop={true}
        autoplay={{
          delay: 5000,
        }}
        spaceBetween={20}
        breakpoints={{
          320: {
            slidesPerView: 1.5,
          },
          640: {
            slidesPerView: 1.5,
          },
          768: {
            slidesPerView: 2.5,
          },
          1024: {
            slidesPerView: 4,
          },
        }}
      >
        {items.map((item, index) => (
          <SwiperSlide key={index}>
            <HomeCarouselItem
              imageSrc={item.imageSrc}
              title={item.title}
              description={item.description}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </motion.div>
  );
};

export default HomeCarousel;
