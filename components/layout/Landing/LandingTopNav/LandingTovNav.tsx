import { Home, LayoutDashboard, LogIn } from "lucide-react";
import Link from "next/link";
import React from "react";
import Logo from "@/assets/Coachino.svg";
import Image from "next/image";
const LandingTovNav = () => {
  return (
    <div className='sticky top-5 start-1/2 end-1/2 bg-gradient-to-l from-blue-900/40 to-pink-900/40 backdrop-blur-xl p-5 rounded-full border flex gap-10 items-center justify-evenly shadow-lg w-fit px-10 transform -translate-x-1/2 z-50 '>
      <div className='flex gap-5 items-center me-8'>
        <Image
          src={Logo}
          alt='Coachino Logo'
          width={100}
          height={100}
          className='w-6 dark:invert '
        />
        <span className='text-lg font-semibold text-primary neuropolitical'>
          Coachino
        </span>
      </div>
      {LandingTovNavItems.map((item) => (
        <LandingTovNavItem
          key={item.name}
          name={item.name}
          href={item.href}
          icon={item.icon}
        />
      ))}

      <LandingTovNavItem
        name='Login'
        href='/login'
        icon={<LogIn className='w-4 h-4  duration-200 ' />}
        className='ms-10 bg-blue-400/10 hover:bg-blue-400/20'
      />
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
        "flex items-center gap-2 font-semibold text-primary transition-colors group hover:text-pink-500 hover:bg-pink-500/10 rounded-full px-3 py-2 " +
        className
      }
    >
      {icon}
      <span>{name}</span>
    </Link>
  );
};

const LandingTovNavItems = [
  {
    name: "Home",
    href: "/",
    icon: (
      <Home className='w-4 h-4 group-hover:scale-100 scale-0 duration-200' />
    ),
  },
  {
    name: "Panel",
    href: "/panel",
    icon: (
      <LayoutDashboard className='w-4 h-4 group-hover:scale-100 scale-0 duration-200' />
    ),
  },
];

export default LandingTovNav;
