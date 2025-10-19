"use client";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const CoachinoButton = () => {
  const path = usePathname();
  if (path === "/panel") return null;
  return (
    <Link
      href='/panel'
      className='fixed md:bottom-3 md:top-auto bottom-auto top-4 end-4 z-50'
    >
      <Button
        variant='default'
        className='aspect-square md:w-12 md:h-12 w-10 h-10 rounded-md bg-gradient-to-tr bg-accent text-accent-foreground shadow-2xl  backdrop-blur-lg relative'
      >
        <div className='absolute inset-0 rounded-md border-2 border-red-500 animate-ping -z-10'></div>
        <MessageCircle className='md:size-6 fill-accent-foreground' />
      </Button>
    </Link>
  );
};

export default CoachinoButton;
