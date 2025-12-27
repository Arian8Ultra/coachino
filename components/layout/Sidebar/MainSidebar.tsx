// import Logo from "@/assets/SVG/NexMag.svg";
// import LogoW from "@/assets/SVG/Nexiino Dark.svg";
import Logo from "@/assets/Coachino.svg";

import { GetUserId } from "@/auth/AuthFunctions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { Ellipsis, UserRound } from "lucide-react";
import { IconName } from "lucide-react/dynamic";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import ThemeButton from "../Theme/ThemeButton";
import LogoutButton from "./LogoutButton";
import SidebarItem from "./SidebarItem";
import { prisma } from "@/prisma/prisma";
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

  const currentUserSubscription = await prisma.userSubscription.findFirst({
    where: {
      userId: user.id,
      isActive: true,
    },
    include: {
      subscription: true,
    },
  });

  const notifications = await prisma.notification.findMany({
    where: {
      userId: user?.id,
      isRead: false,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // const chats = await Chat_GetByUserId(userId);

  return (
    <>
      {/* <SidebarToggle /> */}
      <Sidebar
        variant='floating'
        side='right'
        className='rounded-r-none bg-transparent! border-0! shadow-none! *:shadow-none! *:bg-transparent!'
        // className='bg-white/50! dark:bg-black/30!  h-auto rounded-lg overflow-hidden p-2 *:shadow-none! *:bg-transparent! dark:bg-linear-to-tr from-primary/30 to-accent/30 *:backdrop-blur-2xl rounded-r-none'
        // className='border-e'
        collapsible='icon'
      >
        <div className='w-1 bg-linear-0 from-primary via-accent to-primary h-11/12 rounded-full absolute left-0 -translate-x-full -translate-y-1/2 top-1/2' />
        <SidebarHeader
        // className='border-b border-sidebar-ring/30'
        >
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
                <p>کوچ در هر لحظه</p>
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
        <SidebarContent className='relative'>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {SidebarItems.map((item) => (
                  <SidebarItem
                    item={{
                      ...item,
                      number:
                        item.url === "/panel/notifications"
                          ? notifications.length
                          : undefined,
                    }}
                    key={item.url}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter
        // className='border-t border-sidebar-ring/30'
        >
          {/* <div className='w-full flex justify-end items-end'>
          </div> */}
          <Link
            href='/panel/profile'
            className='flex items-center justify-between w-full p-1'
          >
            <Avatar className='w-10 h-10 rounded-full'>
              <AvatarImage src='https://github.com/shadcn.png' />
              <AvatarFallback className='bg-primary text-secondary'>
                {user?.name?.slice(0, 2).toUpperCase() || "US"}
              </AvatarFallback>
            </Avatar>
            <div className='flex gap-4 items-center justify-center flex-1 text-center'>
              <span className='font-semibold text-sidebar-text w-fit'>
                {user?.name || "User"}
              </span>
              <span
                className={`text-xs text-sidebar-text/70  px-1 py-1 rounded-full w-fit ${
                  currentUserSubscription?.subscription.level === 1
                    ? "text-primary bg-primary/20"
                    : currentUserSubscription?.subscription.level === 2
                    ? "text-gray-500 bg-gray-500/20"
                    : "text-amber-500 bg-amber-500/20"
                }
                `}
              >
                {currentUserSubscription?.subscription.isFree
                  ? "رایگان"
                  : `${currentUserSubscription?.subscription.name}`}
              </span>
            </div>
            <DropdownMenu dir='rtl'>
              <DropdownMenuTrigger>
                <Ellipsis className='w-6 h-6 cursor-pointer text-sidebar-text hover:text-sidebar-primary' />
              </DropdownMenuTrigger>
              <DropdownMenuContent className='rtl *:p-3 bg-glass backdrop-blur-lg border border-sidebar-ring/30 '>
                {/* <DropdownMenuItem className='rtl text-start hover:!bg-transparent hover:text-primary !p-0'>
                  <Button
                    variant='ghost'
                    className='w-full text-start justify-between hover:bg-transparent hover:text-primary'
                  >
                    <Gem className='w-4 h-4 inline me-2' />
                    خرید پلن
                  </Button>
                </DropdownMenuItem> */}
                <DropdownMenuItem className='rtl text-start hover:bg-transparent! hover:text-primary p-0!'>
                  <Link href='/panel/profile' className='w-full'>
                    <Button
                      variant='ghost'
                      className='w-full text-start justify-between hover:bg-transparent hover:text-primary'
                    >
                      <UserRound className='w-4 h-4 inline me-2' />
                      پروفایل
                    </Button>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className='p-0!' />
                <DropdownMenuItem className='rtl text-start p-0!'>
                  <LogoutButton />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </Link>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
    </>
  );
};

export default MainSidebar;

export const SidebarItems: {
  title: string;
  url: string;
  iconName: IconName;
  disabled?: boolean;
  showInBotNav?: boolean;
}[] = [
  {
    title: "کوچینو",
    url: "/panel",
    iconName: "message-circle",
    disabled: false,
    showInBotNav: true,
  },
  {
    title: "داشبورد",
    url: "/panel/dashboard",
    iconName: "layout-dashboard",
    disabled: false,
    showInBotNav: true,
  },
  {
    title: "آزمون ها",
    url: "/panel/exams",
    iconName: "circle-question-mark",
    disabled: false,
    showInBotNav: true,
  },
  {
    title: "سناریو ها",
    url: "/panel/scenarios",
    iconName: "shapes",
    disabled: false,
    showInBotNav: true,
  },
  {
    title: "تسک ها",
    url: "/panel/tasks",
    iconName: "clipboard-list",
    disabled: false,
    showInBotNav: true,
  },
  {
    title: "اطلاعیه ها",
    url: "/panel/notifications",
    iconName: "alarm-clock",
    disabled: false,
    showInBotNav: true,
  },
];
