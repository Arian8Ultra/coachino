"use client";
import React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LucideFormInput } from "lucide-react";
const ChangePasswordModal = () => {
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmNewPassword, setConfirmNewPassword] = React.useState("");

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"ghost"} className='w-full justify-start'>
          <LucideFormInput className='w-5 h-5 me-2' />
          تغییر رمز عبور
        </Button>
      </DialogTrigger>
      <DialogContent className='max-w-lg'>
        <DialogHeader>
          <DialogTitle>تغییر رمز عبور</DialogTitle>
        </DialogHeader>
        <div className='flex flex-col gap-4'>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='current-password'>رمز عبور فعلی</Label>
            <Input
              id='current-password'
              type='password'
              placeholder='رمز عبور فعلی خود را وارد کنید'
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='new-password'>رمز عبور جدید</Label>
            <Input
              id='new-password'
              type='password'
              placeholder='رمز عبور جدید خود را وارد کنید'
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='confirm-new-password'>تایید رمز عبور جدید</Label>
            <Input
              id='confirm-new-password'
              type='password'
              placeholder='رمز عبور جدید خود را مجددا وارد کنید'
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
            />
          </div>
          <Button
            className='w-full mt-4'
            variant='default'
            onClick={async () => {
              if (newPassword !== confirmNewPassword) {
                toast.error("رمز عبور جدید و تایید آن مطابقت ندارند.");
                return;
              }
              const response = await fetch("/api/auth/change_password", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  currentPassword,
                  newPassword,
                  confirmNewPassword,
                }),
              });
              const data = await response.json();
              if (response.ok) {
                toast.success("رمز عبور با موفقیت تغییر کرد.");
                setCurrentPassword("");
                setNewPassword("");
                setConfirmNewPassword("");
              } else {
                toast.error(data.error || "خطایی در تغییر رمز عبور رخ داد.");
              }
            }}
          >
            تغییر رمز عبور
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChangePasswordModal;
