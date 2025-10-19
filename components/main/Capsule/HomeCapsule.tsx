import React from "react";
import * as motion from "motion/react-client";
import { DynamicIcon, IconName } from "lucide-react/dynamic";
const HomeCapsule = () => {
  const items = [
    {
      title: "شخصیت شناسی",
      description:
        "با استفاده از تست های شخصیت شناسی، نقاط قوت و ضعف خود را  شناسایی کنید و در مسیر رشد فردی خود گام بردارید.",
      iconName: "user",
    },
    {
      title: "گرفتن مشاوره",
      description:
        "از کوچینو مشاوره بگیرید و در مسیر پیشرفت خود از راهنمایی های حرفه ای بهره مند شوید.",
      iconName: "message-square",
    },
    {
      title: "برنامه ریزی",
      description:
        "با استفاده از ابزارهای برنامه ریزی کوچینو، اهداف خود را مشخص کنید و به صورت مرحله به مرحله به آن ها دست یابید.",
      iconName: "calendar",
    },
  ] as {
    title: string;
    description: string;
    iconName: IconName;
  }[];

  return (
    <motion.div
      className={
        "flex flex-col gap-10 md:gap-0 md:grid md:grid-cols-3 p-e md:py-3 py-15 bg-glass/50 backdrop-blur-3xl relative shadow-[0px_10px_198px_23px] shadow-primary/50 md:h-fit h-screen justify-between"
      }
      initial={{ opacity: 0, scaleX: 0.9, scaleY: 0.9 }}
      animate={{ opacity: 1, scaleX: 1, scaleY: 1 }}
      whileInView={{ opacity: 1, scaleX: 1, scaleY: 1 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      {items.map((item, index) => (
        <motion.div
          key={index}
          className='flex flex-col items-center justify-center px-5 py-3 gap-3 md:last:border-r md:first:border-l md:first:border-r-0 '
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.2 }}
          viewport={{ once: true }}
        >
          <DynamicIcon name={item.iconName} className='h-8 w-8' />
          <h3 className='text-lg font-semibold '>{item.title}</h3>
          <p className='text-muted-foreground text-center text-sm'>
            {item.description}
          </p>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default HomeCapsule;
