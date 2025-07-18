"use client";
import { motion } from "motion/react";
import React from "react";

interface Props {
  className?: string;
  once?: boolean;
  amount?: number;
  duration?: number;
  delay?: number;
  children?: React.ReactNode;
}
const LandingGridItem = ({
  className = "",
  amount,
  delay,
  duration,
  once,
  children,
}: Props) => {
  return (
    <motion.div
      className={`${className}`}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0}}
      viewport={{ once, amount }}
      transition={{ duration, delay, type: "spring", stiffness: 90 }}
    >
      {children}
    </motion.div>
  );
};

export default LandingGridItem;
