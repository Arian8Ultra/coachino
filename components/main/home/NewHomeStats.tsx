import { VerticalLamp } from "@/components/ui/lamp";
import {
  Briefcase,
  Presentation,
  Smile,
  UsersRound
} from "lucide-react";
import * as motion from "motion/react-client";
import HomeStatCard from "./HomeStatCard";

const NewHomeStats = () => {
  const stats = [
    {
      title: "تعداد کوچینگ",
      value: "+۱۸۹۰",
      unit: "نفر",
      icon: <Presentation className='text-[#FB6D9D]' />,
      lampColor: "#FB6D9D",
    },
    {
      title: "رضایت کاربران",
      value: "۹۶٪",
      unit: "رضایت",
      icon: <Smile className='text-[#9F8BFA]' />,
      lampColor: "#9F8BFA",
    },
    {
      title: "مشتریان سازمانی",
      value: "۱۳",
      unit: "نفر",
      icon: <Briefcase className='text-[#2196F3]' />,
      lampColor: "#2196F3",
    },
    {
      title: "کاربران فعال",
      value: "+۲۷۰",
      unit: "نفر",
      icon: <UsersRound className='text-[#ffac4d]' />,
      lampColor: "#ffac4d",
    },
  ];
  return (
    <motion.div
      className='flex flex-col gap-10 w-full md:px-20 px-10'
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
    >
      <motion.div
        className='grid md:grid-cols-4 grid-cols-1 gap-10 md:gap-20 w-full'
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
      >
        {stats.map((stat, index) => (
          <HomeStatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            lampColor={stat.lampColor}
            unit={stat.unit}
          />
        ))}
      </motion.div>

      <div className='flex gap-4'>
        <VerticalLamp
          color={"#2196F3"}
          lampThickness='2.5px'
          className='flex flex-col items-center justify-center gap-4 z-20 *:h-full!'
        />
        <p className='text-xl text-start leading-14'>
          {/* یه رازی بهت بگم؟
          <br /> */}
          رویای تو فقط یه تصمیم باهات فاصله داره؛
          <br />
          <span className='font-bold text-2xl'>
            یه شروع متفاوت، با کوچ هوشمند!
          </span>
        </p>
      </div>
    </motion.div>
  );
};

export default NewHomeStats;
