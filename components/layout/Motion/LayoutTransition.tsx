"use client";
import { AnimatePresence, motion } from "motion/react";
import { usePathname } from "next/navigation";

interface LayoutTransitionProps {
  children: React.ReactNode;
  className?: React.ComponentProps<typeof motion.div>["className"];
  style?: React.ComponentProps<typeof motion.div>["style"];
  initial: React.ComponentProps<typeof motion.div>["initial"];
  animate: React.ComponentProps<typeof motion.div>["animate"];
  exit: React.ComponentProps<typeof motion.div>["exit"];
}

export function LayoutTransition({
  children,
  className,
  style,
  initial,
  animate,
  exit,
}: LayoutTransitionProps) {
  const path = usePathname();

  return (
    <AnimatePresence mode='wait' initial={false}>
      <motion.div
        className={className}
        style={style}
        key={path}
        initial={initial}
        animate={animate}
        exit={exit}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
