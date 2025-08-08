"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";
interface Props extends React.ComponentProps<typeof ProgressPrimitive.Root> {
  backgroundColor?: string;
  barColor?: string;
}
function Progress({
  className,
  value,
  backgroundColor = "bg-primary/20",
  barColor = "bg-primary",
  ...props
}: Props) {
  return (
    <ProgressPrimitive.Root
      data-slot='progress'
      className={cn(
        " relative h-2 w-full overflow-hidden rounded-full",
        backgroundColor,
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot='progress-indicator'
        // className='bg-primary h-full w-full flex-1 transition-all'
        className={cn(
          "flex h-full w-full items-center justify-center rounded-full transition-all",
          barColor,
        )}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };
