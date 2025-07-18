"use client";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";
import { Button } from "../../ui/button";
import { LogOut } from "lucide-react";

const LogoutButton = () => {
  const router = useRouter();
  // This component can be used to handle user logout functionality by sending a request to the server to invalidate the user's session or token.

  const handleLogout = async () => {
    // Make a POST request to the logout API endpoint
    const response = await fetch("/api/auth/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      toast.success("Logout successful!");
      router.push("/login"); // Redirect to login page after successful logout
    } else {
      // Handle error case
      console.error("Logout failed");
      toast.error("Logout failed. Please try again.");
    }
  };
  return (
    <Button
      variant='outline'
      className='flex-1 text-red-500'
      onClick={handleLogout}
    >
        <LogOut className='mr-2 h-4 w-4' />
      Logout
    </Button>
  );
};

export default LogoutButton;
