"use client";

import { Tast_GetUserTasks } from "@/prisma/functions/Tasks/TasksFun";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import DashTaskCard from "./DashTaskCard";

interface Props {
  tasks: Tast_GetUserTasks;
}
const DashTaskSwiper = ({ tasks }: Props) => {
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
        {tasks
          ?.sort((a, b) => {
            return (
              (a.dueDate &&
                b.dueDate &&
                new Date(a.dueDate).getTime() -
                  new Date(b.dueDate).getTime()) ||
              0
            );
          })
          .map((task) => (
            <SwiperSlide key={task.id}>
              <DashTaskCard task={task} />
            </SwiperSlide>
          ))}
      </Swiper>
    </div>
  );
};

export default DashTaskSwiper;
