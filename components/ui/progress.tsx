"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";
interface Props extends React.ComponentProps<typeof ProgressPrimitive.Root> {
  backgroundColor?: string;
  barColor?: string;
  textColor?: string;
}
function Progress({
  className,
  value,
  backgroundColor = "bg-primary/20",
  barColor = "bg-primary",
  textColor = "text-primary",
  ...props
}: Props) {
  const ref = React.useRef<HTMLDivElement>(null);
  return (
    <ProgressPrimitive.Root
      data-slot='progress'
      className={cn(
        " relative h-2 w-full overflow-y-visible overflow-x-clip rounded-full",
        backgroundColor,
        className,
      )}
      ref={ref}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot='progress-indicator'
        // className='bg-primary h-full w-full flex-1 transition-all'
        className={cn(
          "flex h-full items-center justify-center rounded-full transition-all",
          barColor,
        )}
        // set the width of the indicator to the value passed but it must be according to the root width
        style={{
          width: `${value}%`,
        }}
      />
      {/* a percent overlay on the indicator */}
      {value !== undefined && (
        <span
          className={cn(
            "absolute text-xs font-medium text-primary rounded-full p-2 py-1.5 w-fit backdrop-blur-md shadow-md bg-glass dark:bg-white/55",
            textColor,
          )}
          // put it where the indicator end is
          style={{
            right: `${value}%`,
            transform: "translateX(50%) translateY(-50%)",
            top: "50%",
            transformOrigin: "right",
          }}
        >
          {Math.round(value || 0)}%
        </span>
      )}
    </ProgressPrimitive.Root>
  );
}

export { Progress };
