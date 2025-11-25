import { cn } from "@/lib/utils";
import React from "react";
interface Props {
  children: React.ReactNode;
  rotate?: string;
  className?:string;
}
const GlassBall = ({ children, rotate,className }: Props) => {
  return (
    <div
      className={cn(
        "rounded-full p-4 text-2xl backdrop-blur-md shadow-[inset_-1px_-1px_5px_0.01px_rgba(255,255,255,0.9)] items-center justify-center",
        className,
        rotate,
      )}
    >
      {children}
    </div>
  );
};

export default GlassBall;
