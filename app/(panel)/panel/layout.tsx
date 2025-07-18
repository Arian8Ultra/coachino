import { GetUser } from "@/auth/AuthFunctions";
import MainSidebar from "@/components/layout/Sidebar/MainSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { cookies } from "next/headers";
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
    <section>
      <SidebarProvider>
        {/* <TopNav /> */}
        <MainSidebar user={GetUser(token)} />
        <div className='bg-sidebar border border-sidebar-border flex-1 m-2 rounded-lg overflow-hidden p-2'>
          <NextTopLoader />

          {/* <TopNav /> */}
          {children}
        </div>
      </SidebarProvider>
    </section>
  );
}
