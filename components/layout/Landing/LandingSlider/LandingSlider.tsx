"use client";
import { A11y, Autoplay, EffectFade, } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
// import Swiper styles
import Image from "next/image";
import "swiper/css";
import 'swiper/css/effect-fade';
interface Props {
  className?: string;
}
const LandingSlider = ({ className = "" }: Props) => {
  return (
    <Swiper
      effect='fade'
      modules={[EffectFade, Autoplay, A11y]}
      className={"w-full h-full " + className}
      loop={true}
      autoplay={{
        delay: 5000,
      }}
    >
      <SwiperSlide>
        <Image
          src={"/slider/coachino 1.jpg"}
          width={1000}
          height={1000}
          alt='Slider Image 1'
          quality={100}
          className='w-full h-full object-cover md:aspect-[2/1] aspect-square rounded-3xl'
        />
      </SwiperSlide>
      <SwiperSlide>
        <Image
          src={"/slider/coachino 2.jpg"}
          width={1000}
          height={1000}
          alt='Slider Image 1'
          quality={100}
          className='w-full h-full object-cover md:aspect-[2/1] aspect-square rounded-3xl'
        />
      </SwiperSlide>
      <SwiperSlide>
        <Image
          src={"/slider/coachino 3.jpg"}
          width={1000}
          height={1000}
          alt='Slider Image 1'
          quality={100}
          className='w-full h-full object-cover md:aspect-[2/1] aspect-square rounded-3xl'
        />
      </SwiperSlide>
      {/* <SwiperSlide>
        <Image
          src={"/slider/Slider2.png"}
          width={1000}
          height={1000}
          alt='Slider Image 2'
          className='w-full h-full object-cover aspect-[2/1] rounded-3xl'
        />
      </SwiperSlide> */}
    </Swiper>
  );
};

export default LandingSlider;
