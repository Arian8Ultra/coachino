import Logo from "@/assets/CoachinoWithText.svg";
import { IsAuthenticated } from "@/auth/AuthFunctions";
import { LayoutDashboard, LogIn } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const LandingTovNav = async () => {
  const user = await IsAuthenticated();
  return (
    <div className='md:w-fit sticky mx-5 flex items-center p-3 justify-center gap-3 md:fixed md:start-1/2 md:translate-x-1/2 top-5 z-50 rounded-full backdrop-blur-lg'>
      <Image
        src={Logo}
        alt='Coachino Logo'
        width={100}
        height={100}
        className='w-32 dark:invert-0 invert'
      />
      {/* a divider */}
      <div className='w-[2px] h-4 rounded-full bg-gray-300 dark:bg-gray-600'></div>
      {!user ? (
        <LandingTovNavItem
          name='ورود'
          href='/login'
          icon={<LogIn className='w-4 h-4' />}
          className='whitespace-nowrap'
        />
      ) : (
        <LandingTovNavItem
          name='ورود به پنل'
          href='/panel'
          icon={<LayoutDashboard className='w-4 h-4' />}
          className='whitespace-nowrap'
        />
      )}
      <div className='absolute bottom-0 w-3/4 h-[3px] bg-gradient-to-r from-accent to-primary  translate-x-1/2 start-1/2 mask-radial-at-center mask-radial-from-0% mask-radial-to-100% ' />
      <div className='absolute bottom-0 w-3/4 h-10 bg-gradient-to-r from-accent to-primary blur-xs translate-x-1/2 start-1/2 translate-y-1/2 mask-radial-at-center mask-radial-from-0 mask-radial-to-60% opacity-70 mask-t-from-[52%] mask-t-to-[52%]' />
    </div>
  );
};

const LandingTovNavItem = ({
  name,
  href,
  icon,
  className = "",
}: {
  name: string;
  href: string;
  icon: React.ReactNode;
  className?: string;
}) => {
  return (
    <Link
      href={href}
      className={
        "flex md:flex-row items-center gap-2 font-semibold px-3 py-2 " +
        className
      }
    >
      {icon}
      <span>{name}</span>
    </Link>
  );
};

export default LandingTovNav;
