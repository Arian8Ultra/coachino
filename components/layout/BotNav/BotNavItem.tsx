"use client";
import { DynamicIcon, IconName } from "lucide-react/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

interface Props {
  className?: string;
  item: {
    title: string;
    url: string;
    iconName: IconName;
    disabled?: boolean;
    showInBotNav?: boolean;
  };
}
const BotNavItem = ({ className, item }: Props) => {
  const path = usePathname();
  const isActive = path === item.url;
  return (
    <Link
      className='flex flex-col gap-2 items-center justify-center'
      href={item.disabled ? "#" : item.url}
    >
      <DynamicIcon
        name={item.iconName}
        className={`w-6 h-6 ${
          isActive ? "text-primary " : "text-muted-foreground"
        } ${className}`}
      />
      <span
        className={`text-xs ${
          isActive ? "text-primary" : "text-muted-foreground"
        }`}
      >
        {item.title}
      </span>
    </Link>
  );
};

export default BotNavItem;
