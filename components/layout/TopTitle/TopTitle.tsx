import { cn } from "@/lib/utils";
import { IconName, DynamicIcon } from "lucide-react/dynamic";
import React from "react";

interface Props {
  className?: string;
  title?: string;
  iconName: IconName;
  h1?: string;
  sub?: string;
  containerClassName?: string;
}
const TopTitle = ({
  className,
  title,
  iconName = "bot",
  h1,
  sub,
  containerClassName,
}: Props) => {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 items-center justify-center",
        containerClassName,
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center p-3 rounded-md bg-primary/50 text-white mb-2 gap-2 shadow-md",
          className,
        )}
      >
        <DynamicIcon name={iconName} className='w-6 h-6 mr-2' />
        <p className='text-base'>{title || "Default Title"}</p>
      </div>
      {h1 && <h2 className='text-foreground text-center font-bold text-xl'>{h1}</h2>}

      {sub && <p className='text-muted-foreground text-center'>{sub}</p>}
    </div>
  );
};

export default TopTitle;
