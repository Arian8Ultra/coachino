import { GetUser } from "@/auth/AuthFunctions";
import MainSidebar from "@/components/layout/Sidebar/MainSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import NextTopLoader from "nextjs-toploader";
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
    <section className="relative">
      <Image
        src={"/backgrounds/blurgradient.svg"}
        alt='Page Top Background'
        className='absolute top-0 left-0 w-full h-full object-cover opacity-20'
        width={1920}
        height={1080}
      />
      <SidebarProvider>
        {/* <TopNav /> */}
        <MainSidebar user={GetUser(token)} />
        <div className='flex-1 m-4 ms-8 rounded-lg overflow-hidden p-2 backdrop-blur-lg'>
          <NextTopLoader />
          <TopNav />
          {children}
        </div>
      </SidebarProvider>
    </section>
  );
}