// import Logo from "@/assets/SVG/NexMag.svg";
// import LogoW from "@/assets/SVG/Nexiino Dark.svg";
import Logo from "@/assets/Coachino.svg";

import { GetUserId } from "@/auth/AuthFunctions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarRail,
} from "@/components/ui/sidebar";
import { User } from "@/generated/prisma";
import { Ellipsis, Plus } from "lucide-react";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import ThemeButton from "../Theme/ThemeButton";
import LogoutButton from "./LogoutButton";
import SidebarItem from "./SidebarItem";
import SidebarToggle from "./SidebarToggle";
import { IconName } from "lucide-react/dynamic";
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
      <Sidebar
        variant='floating'
        side='right'
        className='!bg-white/50 dark:!bg-black/30 m-4 h-auto rounded-lg overflow-hidden p-2 *:!shadow-none *:!bg-transparent dark:bg-gradient-to-tr from-primary/30 to-accent/30 *:backdrop-blur-2xl '
        collapsible='icon'
      >
        <SidebarHeader className='border-b border-sidebar-ring/30'>
          <div className='flex gap-0 items-center justify-between w-full'>
            <div className='flex flex-1 justify-start gap-4 p-2 '>
              <Image
                src={Logo}
                alt='Nexiino Logo'
                width={100}
                height={100}
                className='w-9 dark:invert '
              />
              <div className='flex flex-col gap-2'>
                <h1 className='text-2xl font-semibold text-sidebar-text neuropolitical'>
                  کوچینو
                </h1>
                <p>کوچ در هر لحظه</p>
              </div>
            </div>
            <ThemeButton />
            {/* <SidebarTrigger /> */}
          </div>
          <Link
            href='/panel'
            // className='text-center bg-primary/15 rounded-full backdrop-blur-2xl py-1.5 px-4 text-primary'
          >
            <Button variant={"glass"}>
              <Plus className='w-6 h-6 inline-block' />
              کوچینگ جدید
            </Button>
          </Link>
        </SidebarHeader>
        <SidebarContent className=''>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarItem item={item} key={item.url} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className='border-t border-sidebar-ring/30'>
          {/* <div className='w-full flex justify-end items-end'>
          </div> */}
          <div className='flex items-center justify-between w-full p-1'>
            <Avatar className='w-10 h-10 rounded-full'>
              <AvatarImage src='https://github.com/shadcn.png' />
              <AvatarFallback className='bg-primary text-secondary'>
                {user?.name?.slice(0, 2).toUpperCase() || "US"}
              </AvatarFallback>
            </Avatar>
            <div className='flex flex-col flex-1 text-center'>
              <span className='font-semibold text-sidebar-text'>
                {user?.name || "User"}
              </span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Ellipsis className='w-6 h-6 cursor-pointer text-sidebar-text hover:text-sidebar-primary' />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Billing</DropdownMenuItem>
                <DropdownMenuItem>Team</DropdownMenuItem>
                <DropdownMenuItem className='hover:!bg-transparent'>
                  <LogoutButton />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
    </>
  );
};

export default MainSidebar;

const items: {
  title: string;
  url: string;
  iconName: IconName;
  disabled?: boolean;
}[] = [
  {
    title: "داشبورد",
    url: "/panel/dashboard",
    iconName: "layout-dashboard",
    disabled: false,
  },
  {
    title: "آزمون ها",
    url: "/panel/exams",
    iconName: "circle-question-mark",
    disabled: false,
  },
  {
    title: "سناریو ها",
    url: "/panel/scenario",
    iconName: "shapes",
    disabled: false,
  },
  {
    title: "تسک ها",
    url: "/panel/tasks",
    iconName: "clipboard-list",
    disabled: true,
  },
];
