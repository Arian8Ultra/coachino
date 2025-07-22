// import Logo from "@/assets/SVG/NexMag.svg";
// import LogoW from "@/assets/SVG/Nexiino Dark.svg";
import Logo from "@/assets/Coachino.svg";

import { GetUserId } from "@/auth/AuthFunctions";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { User } from "@/generated/prisma";
import { MessageCircle, Newspaper } from "lucide-react";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarFallback } from "../../ui/avatar";
import ThemeButton from "../Theme/ThemeButton";
import LogoutButton from "./LogoutButton";
import SidebarToggle from "./SidebarToggle";
interface Props {
  user: User;
}
const MainSidebar = async ({ user }: Props) => {
  const cookie = await cookies();
  const token = cookie.get("token")?.value;

  if (!token) {
    return (
      <div className='text-center mt-20'>
        You need to be logged in to view this page.
      </div>
    );
  }

  const userId = GetUserId(token);
  if (!userId) {
    return <div className='text-center mt-20'>Invalid user ID.</div>;
  }
  // const chats = await Chat_GetByUserId(userId);

  return (
    <>
      <SidebarToggle />
      <Sidebar variant='floating' side='right' className="">
        <SidebarHeader>
          <div className='flex gap-0 items-center justify-evenly w-full'>
            <Image
              src={Logo}
              alt='Nexiino Logo'
              width={100}
              height={100}
              className='w-6 dark:invert '
            />
            <span className='text-lg font-semibold text-primary neuropolitical'>
              کوچینو
            </span>
            <SidebarTrigger />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link href={item.url} className="text-lg p-3">
                        <item.icon />
                        <span>{item.title?.slice(0, 20)}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          {/* <div className='w-full flex justify-end items-end'>
          </div> */}
          <div className='flex items-center justify-between w-full p-1 border border-sidebar-ring/30 rounded-full'>
            <Avatar className='w-10 h-10 rounded-full'>
              {/* <AvatarImage src='https://github.com/shadcn.png' /> */}
              <AvatarFallback className='bg-primary text-secondary'>
                {user?.name?.slice(0, 2).toUpperCase() || "US"}
              </AvatarFallback>
            </Avatar>
            <div className='flex flex-col flex-1 text-center'>
              <span className='text-sm font-semibold text-primary'>
                {user?.name || "User"}
              </span>
            </div>
          </div>
          <div className='flex w-full gap-2'>
            <ThemeButton />
            <LogoutButton />
          </div>
          <p className='text-sm text-gray-500'>
            Nexiino 2025 © All rights reserved.
          </p>
        </SidebarFooter>
      </Sidebar>
    </>
  );
};

export default MainSidebar;

const items = [
  {
    title: "آزمون ها",
    url: "/panel/exams",
    icon: Newspaper,
  },
  {
    title: "چت ها",
    url: "/panel/chats",
    icon: MessageCircle,
  },
];
