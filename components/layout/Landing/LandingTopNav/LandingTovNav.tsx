import Logo from "@/assets/Coachino.svg";
import { LogIn } from "lucide-react";
import { DynamicIcon, IconName } from "lucide-react/dynamic";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import React from "react";
const LandingTovNav = async () => {
  const cookie = await cookies();
  const token = cookie.get("token")?.value;
  return (
    <div className='w-full flex items-center p-5'>
      <div className='flex gap-5 items-center me-8'>
        <Image
          src={Logo}
          alt='Coachino Logo'
          width={100}
          height={100}
          className='md:w-12 w-8 dark:invert '
        />
        <span className='md:text-2xl text-xl font-semibold'>کوچینو</span>
      </div>
      <div className='flex mx-auto gap-10 items-center'>
        {LandingTovNavItems.map((item) => (
          <LandingTovNavItem
            key={item.name}
            name={item.name}
            href={item.href}
            icon={item.iconName}
          />
        ))}
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
          icon='layout-dashboard'
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
      <DynamicIcon name={icon as IconName} className='w-4 h-4' />
      <span>{name}</span>
    </Link>
  );
};

const LandingTovNavItems = [
  {
    name: "خانه",
    href: "/",
    iconName: "home",
  },
  // {
  //   name: "پنل",
  //   href: "/panel",
  //   iconName: "layout-dashboard",
  // },
] as {
  name: string;
  href: string;
  iconName: IconName;
}[];

export default LandingTovNav;
