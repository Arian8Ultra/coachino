"use client";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { DynamicIcon, IconName } from 'lucide-react/dynamic';
interface Props {
  item: {
    title: string;
    url: string;
    iconName: IconName;
    disabled?: boolean;
    showInBotNav?: boolean;
  };
}
const SidebarItem = ({ item }: Props) => {
  const path = usePathname();
  const isActive = path === item.url;
  return (
    <SidebarMenuItem key={item.title}>
      <SidebarMenuButton asChild>
        <Link
          href={item.disabled ? "#" : item.url}
          className={`!text-base p-6 px-2 flex gap-4 ${
            item.disabled ? "cursor-not-allowed opacity-50" : ""
          } ${isActive ? "bg-primary/10 text-primary" : ""}`}
        >
          <DynamicIcon name={item.iconName} className='!w-5 !h-5' />
          <span>{item.title?.slice(0, 20)}</span>
          {item.disabled && (
            <span className='text-amber-500 bg-amber-500/20 rounded-full px-2 py-1 text-xs ms-auto'>
              به زودی
            </span>
          )}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

export default SidebarItem;
