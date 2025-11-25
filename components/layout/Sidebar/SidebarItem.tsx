"use client";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { DynamicIcon, IconName } from "lucide-react/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
interface Props {
  item: {
    title: string;
    url: string;
    iconName: IconName;
    disabled?: boolean;
    showInBotNav?: boolean;
  };
}
const SidebarItem = ({ item }: Props) => {
  const path = usePathname();
  const isActive = path === item.url;
  return (
    <SidebarMenuItem key={item.title}>
      <SidebarMenuButton asChild>
        <Link
          href={item.disabled ? "#" : item.url}
          className={`text-base! p-6 px-2 flex gap-4 ${
            item.disabled ? "cursor-not-allowed opacity-50" : ""
          } ${isActive ? "-bg-linear-90 from-primary/30 to-transparent text-primary" : ""}`}
        >
          <DynamicIcon name={item.iconName} className='w-5! h-5!' />
          <span>{item.title?.slice(0, 20)}</span>
          {item.disabled && (
            <span className='text-amber-500 bg-amber-500/20 rounded-full px-2 py-1 text-xs ms-auto'>
              به زودی
            </span>
          )}
          {/* {isActive && (
            <>
              <div className='w-full bg-radial from-primary to-transparent h-2/3 translate-y-1/2 absolute bottom-0 start-1/2 translate-x-1/2 blur-sm mask-radial-from-0% mask-x-from-80% mask-x-to-100% mask-b-from-40% mask-b-to-100%' />
              <div className='w-full bg-radial from-primary to-transparent h-1 rounded-full absolute bottom-0 start-1/2 translate-x-1/2 ' />
            </>
          )} */}
          {/* {isActive && <Lamp className="absolute w-full bottom-0" />} */}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

export default SidebarItem;
