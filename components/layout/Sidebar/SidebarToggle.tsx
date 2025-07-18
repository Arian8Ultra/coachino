"use client";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { Sidebar } from "lucide-react";
import React from "react";

const SidebarToggle = () => {
  const { open, openMobile, isMobile, setOpen, setOpenMobile } = useSidebar();
  return (
    <Button
      variant='ghost'
      className={`fixed z-50 top-4 right-4 ${
        open ? "hidden" : openMobile ? "hidden" : "block"
      }`}
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
