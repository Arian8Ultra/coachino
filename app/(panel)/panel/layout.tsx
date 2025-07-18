import { GetUser } from "@/auth/AuthFunctions";
import MainSidebar from "@/components/layout/Sidebar/MainSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import NextTopLoader from "nextjs-toploader";
import PageTop from "@/assets/page-top.jpg";
import Image from "next/image";
import TopNav from "@/components/layout/TopNav/TopNav";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookie = await cookies();
  const token = cookie.get("token")?.value;

  if (!token) {
    redirect("/login");
  }
  return (
    <section>
      <Image
        src={PageTop}
        alt='Page Top Background'
        className='fixed top-0 left-0 w-full h-[20dvh] object-cover opacity-20 invert dark:invert-0'
        width={1920}
        height={1080}
      />
      <SidebarProvider>
        {/* <TopNav /> */}
        <MainSidebar user={GetUser(token)} />
        <div className='bg-sidebar/30 border border-sidebar-border flex-1 m-2 rounded-lg overflow-hidden p-2 backdrop-blur-lg'>
          <NextTopLoader />

          <TopNav />
          {children}
        </div>
      </SidebarProvider>
    </section>
  );
}
