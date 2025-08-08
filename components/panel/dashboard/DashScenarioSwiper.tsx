"use client";
import { Scenario_GetByUser } from "@/prisma/functions/Scenario/ScenarioFun";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import DashScenarioCard from "./DashScenarioCard";
interface Props {
  scenarios: Scenario_GetByUser;
}
const DashScenarioSwiper = ({ scenarios }: Props) => {
  return (
    <div className='md:w-[calc(100vw-300px)] lg:w-[calc(100vw-400px)] w-[80dvw]'>
      <Swiper
        spaceBetween={20}
        breakpoints={{
          640: {
            slidesPerView: 1,
            spaceBetween: 20,
          },
          768: {
            slidesPerView: 1.5,
            spaceBetween: 20,
          },
          1024: {
            slidesPerView: 2.5,
            spaceBetween: 20,
          },
        }}
      >
        {/* Map through scenarios and create SwiperSlide for each */}
        {scenarios.map((scenario) => (
          <SwiperSlide key={scenario.id}>
            <DashScenarioCard scenario={scenario} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default DashScenarioSwiper;
