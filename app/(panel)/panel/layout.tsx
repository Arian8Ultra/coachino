import { GetUser } from "@/auth/AuthFunctions";
import CoachinoButton from "@/components/layout/CoachinoButton/CoachinoButton";
import MainSidebar from "@/components/layout/Sidebar/MainSidebar";
import TopNav from "@/components/layout/TopNav/TopNav";
import { SidebarProvider } from "@/components/ui/sidebar";
import { cookies } from "next/headers";
import Image from "next/image";
import { redirect } from "next/navigation";
import NextTopLoader from "nextjs-toploader";

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
    <section className='relative'>
      <Image
        src={"/backgrounds/blurgradient.svg"}
        alt='Page Top Background'
        className='fixed top-0 left-0 w-full h-screen object-cover opacity-10 brightness-100 dark:brightness-100 -z-10'
        width={1920}
        height={1080}
      />
      <SidebarProvider>
        {/* <TopNav /> */}
        <MainSidebar user={GetUser(token)} />
        <div className='flex-1 m-4 md:ms-8 rounded-lg p-2 ' id="main-container">
          <NextTopLoader color='#2563eb' />
          <TopNav />
          {children}
          {/* <BotNav /> */}
        </div>
          <CoachinoButton />
      </SidebarProvider>
    </section>
  );
}
