"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Pattern from "@/assets/pattern.svg";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    phone: "",
    password: "",
    showPassword: false,
    otp: "",
  });
  const [otpSent, setOtpSent] = useState(false);

  const onSendOTP = async () => {
    const res = await fetch("/api/auth/otp/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phone: form.phone }),
    });
    if (res.ok) {
      toast.success("کد تایید ارسال شد!");
      setOtpSent(true);
    } else {
      const errorData = await res.json();
      console.error("Sending OTP failed:", errorData);
      toast.error(
        `ارسال کد تایید ناموفق: ${errorData.error || "خطای ناشناخته"}`,
      );
    }
  };

  const onLogin = async () => {
    const res = await fetch("/api/auth/login/otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      const data = await res.json();
      console.log("Login successful:", data);
      toast.success("ورود موفقیت آمیز بود!");
      router.refresh(); // Refresh the page to reflect the login state
      router.push("/panel");
    } else {
      const errorData = await res.json();
      console.error("Login failed:", errorData);
      toast.error(`ورود ناموفق: ${errorData.error || "خطای ناشناخته"}`);
      router.refresh(); // Refresh the page to reflect the login state
    }
  };

  return (
    <div className='relative flex md:items-center items-end-safe justify-center w-full md:p-20 p-5 md:dark:bg-black '>
      <Image
        src={Pattern}
        alt='Nexiino Pattern'
        width={1000}
        height={1000}
        className='absolute top-0 left-0 w-full h-full object-cover opacity-10 md:block hidden'
      />

      <Card className='md:w-fit w-full p-2 md:min-w-xl backdrop-blur-md bg-white/50 dark:bg-stone-900/60'>
        <CardHeader>
          <CardTitle className='text-center text-2xl'>ورود</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col gap-4'>
            <div className='flex flex-col gap-1'>
              <Label htmlFor='phone'>شماره همراه</Label>
              <Input
                id='phone'
                type='tel'
                placeholder='شماره همراه خود را وارد کنید'
                className='w-full'
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='password'>رمز عبور</Label>
              <InputOTP
                id='otp'
                required
                maxLength={6}
                value={form.otp}
                onChange={(e) => {
                  setForm({ ...form, otp: e });
                }}
                autoComplete='one-time-code'
                disabled={!otpSent}
              >
                <InputOTPGroup className='*:p-6 rounded-md gap-1 *:border *:border-none *:rounded-md *:bg-white/30'>
                  <InputOTPSlot index={5} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={0} />
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>
        </CardContent>
        <CardFooter className='flex flex-col gap-2'>
          {!otpSent ? (
            <Button
              className='w-full'
              variant='default'
              onClick={() => {
                onSendOTP();
                // setOtpSent(true);
              }}
            >
              ارسال کد تایید
            </Button>
          ) : (
            <Button className='w-full' variant='default' onClick={onLogin}>
              ورود
            </Button>
          )}

          {/* </Link>  */}
          <div className='grid grid-cols-2 w-full'>
            <Link href='/login/password' className='w-full'>
              <Button className='w-full' variant='link'>
                ورود با رمزعبور
              </Button>
            </Link>
            <Link href='/signup' className='w-full'>
              <Button className='w-full' variant='link'>
                ثبت نام
              </Button>
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
