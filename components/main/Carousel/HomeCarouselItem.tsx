import React from "react";
import * as motion from "motion/react-client";
import Image from "next/image";

interface Props {
  imageSrc: string;
  title: string;
  description: string;
}
const HomeCarouselItem = ({ imageSrc, title, description }: Props) => {
  return (
    <motion.div
      className='relative rounded-xl overflow-hidden shadow-lg aspect-[9/16] group'
      initial={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.05, zIndex: 20 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      <Image
        src={imageSrc}
        alt={title}
        fill
        className='object-cover w-full h-full absolute inset-0 brightness-50 rounded-xl -z-10 blur-none group-hover:brightness-25 group-hover:blur-sm transition-all duration-300'
      />
      <motion.div
        className='flex flex-col items-center justify-center h-full p-5 text-white'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className='text-2xl font-bold mb-2'>{title}</h3>
        {/* a divider */}
        <div className='w-11/12 h-0.5 bg-gradient-to-r from-white/10 via-white to-white/10 my-2 rounded-full'></div>
        <p className='text-lg text-center'>{description}</p>
      </motion.div>
      <div className='absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-xl'></div>
    </motion.div>
  );
};

export default HomeCarouselItem;
