import Logo from "@/assets/Coachino.svg";
import { LayoutDashboard, LogIn } from "lucide-react";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import React from "react";
const LandingTovNav = async () => {
  const cookie = await cookies();
  const token = cookie.get("token")?.value;
  return (
    <div className='w-full flex items-center p-5 justify-between absolute top-0 z-30'>
      <div className='flex gap-5 items-center me-8'>
        <Image
          src={Logo}
          alt='Coachino Logo'
          width={100}
          height={100}
          className='md:w-12 w-8 invert '
        />
        <span className='md:text-2xl text-xl font-semibold text-white'>
          کوچینو
        </span>
      </div>
      {!token ? (
        <LandingTovNavItem
          name='ورود'
          href='/login'
          icon={<LogIn className='w-4 h-4' />}
          className='ms-10 bg-glass shadow-[0px_10px_198px_23px] shadow-primary/50 rounded-full md:px-10 px-5 backdrop-blur-2xl'
        />
      ) : (
        <LandingTovNavItem
          name='پنل'
          href='/panel'
          icon={<LayoutDashboard className='w-4 h-4'/>}
          className='ms-10 bg-glass shadow-[0px_10px_198px_23px] shadow-accent/50 rounded-full md:px-10 px-5 backdrop-blur-2xl'
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
