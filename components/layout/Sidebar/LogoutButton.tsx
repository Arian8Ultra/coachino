"use client";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";
import { Button } from "../../ui/button";
import { LogOut } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";

const LogoutButton = () => {
  const router = useRouter();
  const {  setOpenMobile } = useSidebar();

  // This component can be used to handle user logout functionality by sending a request to the server to invalidate the user's session or token.

  const handleLogout = async () => {
    // Make a POST request to the logout API endpoint
    const response = await fetch("/api/auth/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    setOpenMobile(false);
    if (response.ok) {
      toast.success("خروج با موفقیت انجام شد");
      router.push("/login"); // Redirect to login page after successful logout
    } else {
      // Handle error case
      console.error("Logout failed");
      toast.error("خطا در خروج از حساب کاربری");
    }
  };
  return (
    <Button
      variant='default'
      onClick={handleLogout}
      className='w-full text-start justify-between hover:bg-destructive/20 hover:text-destructive rounded-sm text-destructive bg-transparent'
    >
      <LogOut className='h-4 w-4 text-destructive ' />
      خروج
    </Button>
  );
};

export default LogoutButton;
