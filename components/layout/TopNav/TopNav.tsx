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
    <div className='border sticky start-2 end-2 flex justify-between p-2  items-center z-50 bg-gradient-to-l from-blue-900/40 to-pink-900/40 backdrop-blur-xl rounded-full col-span-full bg-blend-color-dodge md:hidden'>
      <Button
        variant='default'
        className='md:hidden aspect-square w-10 h-10 rounded-full bg-gradient-to-tr from-blue-300 to-pink-300 '
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
