"use client";
import { MoveDownRight, X } from "lucide-react";
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
          ? "absolute top-4 left-4 w-16 h-16 rounded-full"
          : "absolute inset-0 max-w-[70dvw] m-auto max-h-9/12 md:max-h-[80vh] aspect-square rounded-md "
      } overflow-hidden shadow-lg cursor-pointer z-40 ${className || ""}`}
      onClick={() => setBigPictureOpen(!bigPictureOpen)}
    >
      {!bigPictureOpen && <div className='absolute inset-0 bg-black/50' />
      }
      {bigPictureOpen ? (<X
        className='absolute top-2 start-2 z-40'
        onClick={(e) => {
          e.stopPropagation();
          setBigPictureOpen(false);
        }}
      />) : (
        <MoveDownRight className='absolute top-1/2 start-1/2 translate-x-1/2 -translate-y-1/2 z-40'  />
      )}
      
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
