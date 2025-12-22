"use client";
import React from "react";
import { Button } from "../ui/button";
import { toast } from "sonner";

interface Props {
  referralCode?: string;
}

const InviteButton = ({ referralCode }: Props) => {
  return (
    <Button
      variant='shallowGlass'
      className='rounded-full p-4 w-fit'
      onClick={() => {
        const inviteLink = `${window.location.origin}/signup?ref=${referralCode}`;
        navigator.clipboard.writeText(inviteLink);
        toast.success("لینک دعوت کپی شد!");
      }}
    >
      دعوت دوستان
    </Button>
  );
};

export default InviteButton;
