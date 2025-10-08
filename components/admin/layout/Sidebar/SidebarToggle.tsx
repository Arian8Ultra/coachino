"use client";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Sidebar } from "lucide-react";
import React from "react";

interface Props {
  reverse?: boolean;
  className?: string;
}
const SidebarToggle = ({ reverse,className }: Props) => {
  const { open, openMobile, isMobile, setOpen, setOpenMobile } = useSidebar();
  return (
    <Button
      variant='ghost'
      className={cn(`fixed z-50 top-4 right-4 ${
        open
          ? reverse
            ? ""
            : "hidden"
          : openMobile
          ? reverse
            ? ""
            : "hidden"
          : "block"
      }`,className)}
      onClick={() => {
        if (isMobile) {
          setOpenMobile(!openMobile);
        } else {
          setOpen(!open);
        }
      }}
    >
      <Sidebar className='h-6 w-6' />
    </Button>
  );
};

export default SidebarToggle;
