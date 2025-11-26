"use client";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
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
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent
        showCloseButton={false}
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

    // </dialog>
  );
};

export default VideoModal;
