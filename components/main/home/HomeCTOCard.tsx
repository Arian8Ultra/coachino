import { Button } from "@/components/ui/button";
import { DottedGlowBackground } from "@/components/ui/dotted-glow-background";
import * as motion from "motion/react-client";
import Link from "next/link";
const HomeCTOCard = () => {
  return (
    <motion.div
      className='flex w-2/3 mx-auto h-fit p-8 md:p-16 justify-between items-center md:flex-row flex-col gap-10 rounded-2xl overflow-hidden relative '
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
    >
      <div className='w-3/4 bg-radial from-primary to-transparent h-2/3 translate-y-1/2 absolute bottom-0 start-1/2 translate-x-1/2 blur-sm mask-radial-from-0% mask-x-from-80% mask-x-to-100% mask-b-from-40% mask-b-to-100%' />
      <div className='w-3/4 bg-radial from-primary to-transparent h-1 rounded-full absolute bottom-0 start-1/2 translate-x-1/2 ' />
      <DottedGlowBackground
        className='pointer-events-none mask-radial-to-90% mask-radial-at-center'
        opacity={1}
        gap={15}
        radius={1.6}
        colorLightVar='--color-neutral-500'
        glowColorLightVar='--color-neutral-600'
        colorDarkVar='--color-neutral-500'
        glowColorDarkVar='--color-sky-800'
        backgroundOpacity={0}
        speedMin={0.6}
        speedMax={0.9}
        speedScale={1.2}
      />
      <h3 className='text-2xl font-black text-center leading-10'>
        این ماموریت خاص رو از همین لحظه شروع کن!
      </h3>
      <Link href='/signup' className='self-center z-40'>
        <Button
          size={"lg"}
          variant={"outlineHalo"}
          className='p-8 relative'
        >
          {/* <GlassBall className='bg-primary/40  absolute start-0 bottom-1/2 translate-y-1/2 translate-x-1/2'>
            <Sparkle className='text-accent-foreground fill-accent-foreground stroke-0' />
          </GlassBall> */}
          یه کلیک، یه زندگی جدید!
        </Button>
      </Link>
    </motion.div>
  );
};

export default HomeCTOCard;
