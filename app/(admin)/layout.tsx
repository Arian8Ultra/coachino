import { IsAuthenticatedAdmin } from "@/auth/AuthFunctions";
import AdminSidebar from "@/components/admin/layout/Sidebar/MainSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import NextTopLoader from "nextjs-toploader";
export const metadata: Metadata = {
  title: "مدیریت | کوچینو",
  description: "",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await IsAuthenticatedAdmin();

  if (!user) {
    redirect("/login");
  }

  if (!user?.is_admin) {
    redirect("/panel");
  }
  return (
    <section className='bg-background'>
      <SidebarProvider>
        {/* <TopNav /> */}
        <AdminSidebar user={user} />
        <div className='flex-1 m-4 md:ms-8 rounded-lg p-5 bg-white/50! dark:bg-black/30!'>
          <NextTopLoader color='#2563eb' />
          {children}
          {/* <BotNav /> */}
        </div>
      </SidebarProvider>
    </section>
  );
}
