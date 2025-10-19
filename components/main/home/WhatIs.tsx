import React from "react";
import * as motion from "motion/react-client";
import Image from "next/image";

const WhatIs = () => {
  return (
    <motion.div
      className='gap-2 grid md:grid-cols-2 relative bg-glass/60 backdrop-blur-lg'
      initial={{ opacity: 0, y: 0 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
    >
      <div className='flex flex-col gap-10 p-10 h-full '>
        <h2 className='text-3xl font-bold'>
          {" "}
          <span className='text-primary'>کوچینو</span> چیست؟
        </h2>
        <p className='text-lg text-justify h-fit leading-14 my-auto'>
          کوچینو یک مربی شخصی هوشمند است که با شناخت تیپ شخصیتی‌ات (MBTI) و
          عادت‌هایت، برایت هدف‌های S.M.A.R.T می‌چیند، تسک‌های روزانه/هفتگی
          می‌دهد، منابع یادگیری معرفی می‌کند و مسیر پیشرفتت را قدم‌به‌قدم همراهی
          می‌کند.
        </p>
      </div>
      <Image
        src={"/landing/conversation.webp"}
        width={1000}
        height={1000}
        alt='conversation'
        className='w-full'
      />
    </motion.div>
  );
};

export default WhatIs;
