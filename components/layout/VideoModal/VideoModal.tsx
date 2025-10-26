"use client";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
interface Props {
  className?: string;
  src: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  onEnded?: () => void;
}
const VideoModal = ({
  className,
  src,
  autoPlay = true,
  loop = false,
  muted = false,
  controls = true,
  onEnded,
}: Props) => {
  return (
    <motion.div
      className={cn(
        "absolute z-20 p-4 backdrop-blur-sm rounded-md top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-full h-screen ",
        className,
      )}
      initial={{ opacity: 0, scale: 0.4 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.4 }}
      transition={{ duration: 0.5 }}
      whileInView={{
        opacity: 1,
        scale: 1,
      }}
    >
      <motion.div
        className='absolute z-20 p-4 bg-glass backdrop-blur-md rounded-md  top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center md:w-fit'
        initial={{ opacity: 0, scale: 0.4 }}
        whileInView={{
          opacity: 1,
          scale: 1,
        }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <video
          src={src}
          controls={controls}
          loop={loop}
          muted={muted}
          autoPlay={autoPlay}
          onEnded={() => {
            onEnded?.();
          }}
          className='w-full h-full rounded-sm max-h-[80vh]'
          width={2000}
          height={2000}
        />
      </motion.div>
    </motion.div>
  );
};

export default VideoModal;
