import Logo from "@/assets/CoachinoWithText.svg";
import { IsAuthenticated } from "@/auth/AuthFunctions";
import { LayoutDashboard, LogIn } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const LandingTovNav = async () => {
  const user = await IsAuthenticated()
  return (
    <div className='md:w-fit sticky mx-5 flex items-center p-3 justify-center gap-3 md:fixed md:right-1/2 md:translate-x-1/2 top-5 z-50 bg-glass rounded-lg backdrop-blur-lg shadow-[inset_-1px_-1px_3px_0.01px_rgba(0,_0,_0,_0.3)] dark:shadow-[inset_-1px_-1px_3px_0.01px_rgba(255,_255,_255,_0.9)]'>
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
          name='ورود | ثبت نام'
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
