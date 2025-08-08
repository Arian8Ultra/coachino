/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { Menu } from "lucide-react";
interface Props {
  // leftButton?: React.ReactNode;
  rightButton?: React.ReactNode;
  title?: string;
}
const TopNav = (props: Props) => {
  // const path = usePathname();
  const { setOpenMobile, openMobile } = useSidebar();
  
  return (
    <div className='sticky top-5 z-50'>
      <Button
        variant='default'
        className=' md:hidden aspect-square w-10 h-10 rounded-full bg-gradient-to-tr bg-primary text-accent-foreground shadow-2xl  backdrop-blur-lg'
        onClick={() => setOpenMobile(!openMobile)}
      >
        <Menu />
      </Button>
      {/* <div className='flex-1 text-center'>
        <h1 className='text-lg font-semibold text-primary'>{props.title}</h1>
      </div>
      {props.rightButton} */}
    </div>
  );
};

export default TopNav;
