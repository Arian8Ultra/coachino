import { Lamp } from "@/components/ui/lamp";
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
  iconClassName?: string;
}
const TopTitle = ({
  className,
  title,
  iconName = "bot",
  h1,
  sub,
  containerClassName,
  iconClassName,
}: Props) => {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 items-center justify-center relative",
        containerClassName,
      )}
    >
      <Lamp color='#2563eb' lampThickness='3px' className="w-full" />
      <div
        className={cn(
          "flex items-center justify-center p-3 rounded-md mb-2 gap-2 ",
          className,
        )}
      >
        <DynamicIcon
          name={iconName}
          className={cn("w-6 h-6 mr-2", iconClassName)}
        />
        <p className='text-base'>{title || "Default Title"}</p>
      </div>
      {h1 && (
        <h2 className='text-foreground text-center font-bold text-xl'>{h1}</h2>
      )}

      {sub && <p className='text-muted-foreground text-center'>{sub}</p>}
    </div>
  );
};

export default TopTitle;
