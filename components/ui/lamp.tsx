"use client";
import React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export default function LampDemo() {
  return (
    <LampContainer>
      <motion.h1
        initial={{ opacity: 0.5, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className='mt-8 bg-linear-to-br from-slate-300 to-slate-500 py-4 bg-clip-text text-center text-4xl font-medium tracking-tight text-transparent md:text-7xl'
      >
        Build lamps <br /> the right way
      </motion.h1>
    </LampContainer>
  );
}

export const Lamp = ({
  className,
  color,
  lampThickness,
}: {
  className?: string;
  color?: string;
  lampThickness?: string;
}) => {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center overflow-visible",
        className,
      )}
    >
      <motion.div
        className={`absolute top-0 h-[${lampThickness}] rounded-full translate-x-1/2 start-1/2 mask-radial-at-center mask-radial-from-0% mask-radial-to-100%`}
        style={{
          backgroundColor: color,
        }}
        initial={{ width: "5%" }}
        animate={{ width: "75%" }}
        whileInView={{ width: "75%" }}
        transition={{ duration: 0.8 }}
      />
      <motion.div
        className={`absolute top-0 w-3/4 aspect-video blur-sm translate-x-1/2 start-1/2 transform -translate-y-1/2 mask-radial-at-center mask-radial-from-0% mask-radial-to-60% opacity-10 mask-t-from-50% mask-t-to-50%`}
        style={{
          backgroundColor: color,
        }}
        initial={{ width: "5%", opacity: 0 }}
        animate={{ width: "75%", opacity: 0 }}
        whileInView={{ width: "75%", opacity: 0.3 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      />
    </div>
  );
};

export const VerticalLamp = ({
  className,
  color = "#fffac4d",
  lampThickness = "2px",
  lampLightWidth = "auto",
}: {
  className?: string;
  color?: string;
  lampThickness?: string;
  lampLightWidth?: string;
}) => {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center overflow-visible w-fit mx-1 *:h-full!",
        className,
      )}
    >
      <div
        className={`absolute top-0 w-[${lampThickness}] rounded-full  translate-x-1/2 start-1/2  text-transparent`}
        style={{
          backgroundColor: color,
        }}
      >
        .
      </div>
      <div
        className={`absolute top-0 h-full aspect-square translate-x-1/2 start-1/2 transform mask-radial-at-center mask-l-from-0% mask-l-to-100%  mask-y-from-60% mask-y-to-100% opacity-70 mask-r-from-50% mask-r-to-50%`}
        style={{
          backgroundColor: color,
          width: lampLightWidth,
        }}
      />
    </div>
  );
};

export const LampContainer = ({
  children,
  className,
  color,
}: {
  children: React.ReactNode;
  className?: string;
  color?: string;
}) => {
  return (
    <div
      className={cn(
        "relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-950 w-full rounded-md z-0",
        className,
      )}
    >
      <div className='relative flex w-full flex-1 scale-y-125 items-center justify-center isolate z-0 '>
        <motion.div
          initial={{ opacity: 0.5, width: "15rem" }}
          whileInView={{ opacity: 1, width: "30rem" }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          style={{
            backgroundImage: `conic-gradient(var(--conic-position), var(--tw-gradient-stops))`,
          }}
          className={`absolute inset-auto right-1/2 h-56 overflow-visible w-120 bg-gradient-conic from-${color} via-transparent to-transparent text-white [--conic-position:from_70deg_at_center_top]`}
        >
          <div className='absolute  w-full left-0 bg-slate-950 h-40 bottom-0 z-20 mask-[linear-gradient(to_top,white,transparent)]' />
          <div className='absolute  w-40 h-full left-0 bg-slate-950  bottom-0 z-20 mask-[linear-gradient(to_right,white,transparent)]' />
        </motion.div>
        <motion.div
          initial={{ opacity: 0.5, width: "15rem" }}
          whileInView={{ opacity: 1, width: "30rem" }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          style={{
            backgroundImage: `conic-gradient(var(--conic-position), var(--tw-gradient-stops))`,
          }}
          className={`absolute inset-auto left-1/2 h-56 w-120 bg-gradient-conic from-transparent via-transparent to-${color} text-white [--conic-position:from_290deg_at_center_top]`}
        >
          <div className='absolute  w-40 h-full right-0 bg-slate-950  bottom-0 z-20 mask-[linear-gradient(to_left,white,transparent)]' />
          <div className='absolute  w-full right-0 bg-slate-950 h-40 bottom-0 z-20 mask-[linear-gradient(to_top,white,transparent)]' />
        </motion.div>
        <div className='absolute top-1/2 h-48 w-full translate-y-12 scale-x-150 bg-slate-950 blur-2xl'></div>
        <div className='absolute top-1/2 z-50 h-48 w-full bg-transparent opacity-10 backdrop-blur-md'></div>
        <div
          className={`absolute inset-auto z-50 h-36 w-md -translate-y-1/2 rounded-full bg-${color} opacity-50 blur-3xl`}
        ></div>
        <motion.div
          initial={{ width: "8rem" }}
          whileInView={{ width: "16rem" }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className={`absolute inset-auto z-30 h-36 w-64 -translate-y-24 rounded-full bg-${color} blur-2xl`}
        ></motion.div>
        <motion.div
          initial={{ width: "15rem" }}
          whileInView={{ width: "30rem" }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className={`absolute inset-auto z-50 h-0.5 w-120 -translate-y-28 bg-${color} `}
        ></motion.div>

        <div className='absolute inset-auto z-40 h-44 w-full -translate-y-50 bg-slate-950 '></div>
      </div>

      <div className='relative z-50 flex -translate-y-80 flex-col items-center px-5'>
        {children}
      </div>
    </div>
  );
};
