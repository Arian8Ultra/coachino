import { Home, LayoutDashboard, LogIn } from "lucide-react";
import Link from "next/link";
import React from "react";
import Logo from "@/assets/Coachino.svg";
import Image from "next/image";
import { cookies } from "next/headers";
const LandingTovNav = async () => {
  const cookie = await cookies();
  const token = cookie.get("token")?.value;
  return (
    <div
      className='sticky top-5 bg-glass backdrop-blur-xl p-2 rounded-lg border flex gap-10 items-center justify-evenly shadow-lg w-fit px-5 transform z-50 md:start-1/2 md:translate-x-[50%] mx-auto transition-transform duration-200'

    >
      <div className='flex gap-5 items-center me-8'>
        <Image
          src={Logo}
          alt='Coachino Logo'
          width={100}
          height={100}
          className='w-6 dark:invert '
        />
        <span className='text-lg font-semibold  neuropolitical'>
          کوچینو
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
      {!token && (
        <LandingTovNavItem
          name='ورود'
          href='/login'
          icon={<LogIn className='w-4 h-4' />}
          className='ms-10 bg-blue-400/10 hover:bg-blue-400/20'
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
        "flex md:flex-row items-center gap-2 font-semibold text-primary transition-colors group hover:text-pink-500 hover:bg-pink-500/10 rounded-full px-3 py-2 " +
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
    name: "خانه",
    href: "/",
    icon: (
      <Home className='w-4 h-4 group-hover:scale-100 md:scale-0 duration-200' />
    ),
  },
  {
    name: "پنل",
    href: "/panel",
    icon: (
      <LayoutDashboard className='w-4 h-4 group-hover:scale-100 md:scale-0 duration-200' />
    ),
  },
];

export default LandingTovNav;
