'use client';
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const CoachinoButton = () => {
    const path = usePathname();
    if (path === "/panel") return null;
  return (
    <Link href='/panel' className='fixed md:bottom-5 md:top-auto bottom-auto top-5 end-6 z-50'>
      <Button
        variant='default'
        className='aspect-square w-10 h-10 rounded-md bg-gradient-to-tr bg-accent text-accent-foreground shadow-2xl  backdrop-blur-lg'
      >
        <MessageCircle />
      </Button>
    </Link>
  );
};

export default CoachinoButton;
