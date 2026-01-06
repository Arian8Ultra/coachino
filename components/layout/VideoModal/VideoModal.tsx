"use client";
import { useState } from "react";
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
  const [bigPictureOpen, setBigPictureOpen] = useState(true);
  return (
    <div
      className={`${
        !bigPictureOpen
          ? "absolute bottom-4 left-4 w-16 h-16 rounded-full"
          : "absolute inset-0 max-w-[70dvw] m-auto h-9/12 md:max-h-[80vh] aspect-square rounded-md "
      } overflow-hidden shadow-lg cursor-pointer z-40 ${className || ""}`}
      onClick={() => setBigPictureOpen(!bigPictureOpen)}
    >
      <video
        src={src}
        muted={muted}
        autoPlay={!bigPictureOpen ? true : autoPlay}
        loop={loop}
        controls={!bigPictureOpen ? false : controls}
        className='w-full h-full object-cover'
        onEnded={() => {
          onEnded?.();
        }}
      />
    </div>
  );
};

export default VideoModal;
