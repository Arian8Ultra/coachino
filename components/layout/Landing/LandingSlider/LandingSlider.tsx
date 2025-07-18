"use client";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectFade,Autoplay,A11y, } from "swiper/modules";
// import Swiper styles
import "swiper/css";
import 'swiper/css/effect-fade';
import Slider1 from "@/assets/Slider/Slider1.png";
import Slider2 from "@/assets/Slider/Slider2.png";
import Image from "next/image";
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
        delay: 3000,
      }}
    >
      <SwiperSlide>
        <Image
          src={Slider1}
          width={1000}
          height={1000}
          alt='Slider Image 1'
          className='w-full h-full object-cover aspect-[2/1] rounded-3xl'
        />
      </SwiperSlide>
      <SwiperSlide>
        <Image
          src={Slider2}
          width={1000}
          height={1000}
          alt='Slider Image 2'
          className='w-full h-full object-cover aspect-[2/1] rounded-3xl'
        />
      </SwiperSlide>
    </Swiper>
  );
};

export default LandingSlider;
