"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  dialog?: boolean;
}
const VideoModal = ({
  className,
  src,
  autoPlay = true,
  loop = false,
  muted = false,
  controls = true,
  dialog,
  onEnded,
}: Props) => {
  const [bigPictureOpen, setBigPictureOpen] = useState(true);
  return dialog ? (
    <Dialog
      open={bigPictureOpen}
      onOpenChange={() => {
        setBigPictureOpen(false);
      }}
    >
      <DialogContent
        // showCloseButton={false}
        className={`p-0  max-w-full  max-h-full  ${className || ""}`}
      >
        <DialogHeader className='hidden'>
          <DialogTitle className='hidden'>ویدیو توضیح</DialogTitle>
        </DialogHeader>
        <video
          src={src}
          controls={controls}
          loop={loop}
          muted={muted}
          autoPlay={autoPlay}
          onEnded={() => {
            onEnded?.();
          }}
          className='h-full rounded-sm md:max-h-[80vh] w-screen md:w-auto object-contain'
          width={2000}
          height={2000}
        />
      </DialogContent>
    </Dialog>
  ) : (
    <div
      className={`${
        !bigPictureOpen
          ? "absolute top-4 left-4 w-16 h-16 rounded-full"
          : "absolute inset-0 max-w-[70dvw] m-auto max-h-9/12 md:max-h-[80vh] aspect-square rounded-md "
      } overflow-hidden shadow-lg cursor-pointer z-40 ${className || ""}`}
      onClick={() => setBigPictureOpen(!bigPictureOpen)}
    >
      {!bigPictureOpen && <div className='absolute inset-0 bg-black/50' />}
      {bigPictureOpen ? (
        <X
          className='absolute top-2 start-2 z-40'
          onClick={(e) => {
            e.stopPropagation();
            setBigPictureOpen(false);
          }}
        />
      ) : (
        <MoveDownRight className='absolute top-1/2 start-1/2 translate-x-1/2 -translate-y-1/2 z-40' />
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
