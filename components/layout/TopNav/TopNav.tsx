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
    <div className='border sticky start-2 end-2 flex backdrop-blur-md justify-between p-2 rounded-md items-center z-50 bg-sidebar-border/50 col-span-full'>
      <Button
        variant='default'
        className='md:hidden aspect-square w-10 h-10 rounded-full'
        onClick={() => setOpenMobile(!openMobile)}
      >
        <Menu />
      </Button>
      <div className='flex-1 text-center'>
        <h1 className='text-lg font-semibold text-primary'>{props.title}</h1>
      </div>
      {props.rightButton}
    </div>
  );
};

export default TopNav;
