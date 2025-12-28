// import Logo from "@/assets/SVG/NexMag.svg";
// import LogoW from "@/assets/SVG/Nexiino Dark.svg";
import Logo from "@/assets/Coachino.svg";

import { GetUserId } from "@/auth/AuthFunctions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
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
import { Ellipsis } from "lucide-react";
import { IconName } from "lucide-react/dynamic";
import { cookies } from "next/headers";
import Image from "next/image";

import LogoutButton from "@/components/layout/Sidebar/LogoutButton";
import ThemeButton from "@/components/layout/Theme/ThemeButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import SidebarItem from "./SidebarItem";
interface Props {
  user: User;
}
const AdminSidebar = async ({ user }: Props) => {
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
      {/* <SidebarToggle /> */}
      <Sidebar
        variant='floating'
        side='right'
        className='bg-white/50! dark:bg-black/30! m-4 h-auto rounded-lg overflow-hidden p-2 *:shadow-none! *:bg-transparent! *:backdrop-blur-2xl '
        collapsible='icon'
      >
        <div className='w-1 bg-linear-0 from-primary via-accent to-primary h-11/12 rounded-full absolute left-0 -translate-x-full -translate-y-1/2 top-1/2' />
        <SidebarHeader className='border-b border-sidebar-ring/30'>
          <div className='flex gap-0 items-center justify-between w-full'>
            <div className='flex flex-1 justify-start gap-2 p-2 '>
              <Image
                src={Logo}
                alt='Nexiino Logo'
                width={100}
                height={100}
                className='w-9 dark:invert '
              />
              <div className='flex flex-col gap-1'>
                <h1 className='text-2xl font-semibold text-sidebar-text'>
                  کوچینو
                </h1>
                <p>ادمین</p>
              </div>
            </div>
            <ThemeButton />

            {/* <SidebarTrigger /> */}
          </div>
          {/* <Link
            href='/panel'
            // className='text-center bg-primary/15 rounded-full backdrop-blur-2xl py-1.5 px-4 text-primary'
          >
            <Button
              variant={"ghost"}
              className='text-sm text-start text-primary'
            >
              <Plus className='w-6 h-6 inline-block' />
              کوچینگ جدید
            </Button>
          </Link> */}
        </SidebarHeader>
        <SidebarContent className=''>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {SidebarItems.map((item) => (
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
            <DropdownMenu dir='rtl'>
              <DropdownMenuTrigger>
                <Ellipsis className='w-6 h-6 cursor-pointer text-sidebar-text hover:text-sidebar-primary' />
              </DropdownMenuTrigger>
              <DropdownMenuContent className='rtl *:p-3 bg-glass backdrop-blur-lg border border-sidebar-ring/30 '>
                <DropdownMenuItem className='rtl text-start p-0!'>
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

export default AdminSidebar;

export const SidebarItems: {
  title: string;
  url: string;
  iconName: IconName;
  disabled?: boolean;
  showInBotNav?: boolean;
}[] = [
  {
    title: "داشبورد",
    url: "/admin/dashboard",
    iconName: "layout-dashboard",
    disabled: false,
    showInBotNav: true,
  },
  {
    title: "آزمون ها",
    url: "/admin/exams",
    iconName: "message-circle",
    disabled: false,
    showInBotNav: true,
  },
  {
    title: "کاربران",
    url: "/admin/users",
    iconName: "users",
    disabled: false,
    showInBotNav: true,
  },
  {
    title: "اشتراک ها",
    url: "/admin/subscriptions",
    iconName: "credit-card",
    disabled: false,
    showInBotNav: true,
  },
  {
    title: "بازخوردها",
    url: "/admin/feedbacks",
    iconName: "thumbs-up",
    disabled: false,
    showInBotNav: true,
  },
];
