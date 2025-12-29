"use client";
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
import { Switch } from "@/components/ui/switch";
import { LucideFormInput } from "lucide-react";
import React from "react";
import { toast } from "sonner";

const ChangePasswordModal = () => {
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmNewPassword, setConfirmNewPassword] = React.useState("");
  const [otpSent, setOtpSent] = React.useState(false);
  const [otpMode, setOtpMode] = React.useState(false);
  const [otp, setOtp] = React.useState("");

  const handleSendOtp = async () => {
    try {
      const response = await fetch("/api/auth/change_password/otp/send", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        toast.success("کد OTP با موفقیت ارسال شد.");
        setOtpSent(true);
      }
    } catch {
      toast.error("خطا در ارسال کد OTP.");
    }
  };

  const handleChangePassword = async () => {
    if (otpMode) {
      if (!otp) {
        toast.error("لطفا کد OTP را وارد کنید.");
        return;
      }
      const response = await fetch("/api/auth/change_password/otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ otp, newPassword, confirmNewPassword }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success("رمز عبور با موفقیت تغییر کرد.");
        setOtp("");
        setNewPassword("");
        setConfirmNewPassword("");
      } else {
        toast.error(data.error || "خطایی در تغییر رمز عبور رخ داد.");
      }
    } else {
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
    }
  };

  return (
    <Dialog >
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
          <div className='flex justify-evenly gap-5 items-center'>
            <Label htmlFor='otp-mode'>استفاده از رمز عبور فعلی</Label>
            <Switch
              id='otp-mode'
              checked={otpMode}
              onCheckedChange={(checked) => setOtpMode(checked)}
            />
            <Label htmlFor='otp-mode'>استفاده از کد OTP</Label>
          </div>
          {otpMode ? (
            <div className='flex flex-col gap-2'>
              <div className='flex items-center gap-2'>
                <Input
                  id='otp'
                  type='text'
                  placeholder='کد OTP را وارد کنید'
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
                <Button
                  variant='glass'
                  onClick={handleSendOtp}
                  disabled={otpSent}
                  className="w-fit"
                >
                  {otpSent ? "کد ارسال شد" : "ارسال کد OTP"}
                </Button>
              </div>
            </div>
          ) : (
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
          )}

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
            onClick={handleChangePassword}
          >
            تغییر رمز عبور
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChangePasswordModal;
