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
import { Eye, EyeClosed } from "lucide-react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Logo from "@/assets/CoachinoWithText.svg";

export default function SignupPage() {
  // const { password, confirmPassword, phone, name } = body;
  const [formData, setFormData] = useState({
    phone: "",
    password: "",
    confirmPassword: "",
    name: "",
    showPassword: false,
    showConfirmPassword: false,
    otp: "",
  });
  const [otpSent, setOtpSent] = useState(false);
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/panel";
  const router = useRouter();
  const onSendOTP = async () => {
    const res = await fetch("/api/auth/otp/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phone: formData.phone }),
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

  const onRegister = async () => {
    if (formData.password !== formData.confirmPassword) {
      toast.error("رمزهای عبور مطابقت ندارند!");
      return;
    }

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone: formData.phone,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        name: formData.name,
        otp: formData.otp,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      console.log("Registration successful:", data);
      toast.success("ثبت نام با موفقیت انجام شد!");
      router.push(redirectTo || "/panel");
    } else {
      const errorData = await res.json();
      console.error("Registration failed:", errorData);
      toast.error(`ثبت نام ناموفق: ${errorData.error || "خطای ناشناخته"}`);
    }
  };

  return (
    <div className='relative flex md:items-center items-end-safe justify-center w-auto md:p-20 md:dark:bg-black m-2 rounded-lg md:bg-glass'>
      <Image
        src={Pattern}
        alt='Nexiino Pattern'
        width={1000}
        height={1000}
        className='absolute top-0 left-0 w-full h-full object-cover opacity-10 md:block hidden rounded-lg'
      />

      <Card className='md:w-fit w-full p-2 md:min-w-xl backdrop-blur-md bg-white/50 dark:bg-stone-900/60 m-3'>
        <CardHeader>
          <Image
            src={Logo}
            alt='Coachino Logo'
            width={100}
            height={100}
            className='w-1/3 dark:invert-0 invert mx-auto mb-2'
          />
          <CardTitle className='text-center text-2xl'>ثبت نام</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col gap-4'>
            <div className='flex flex-col gap-1'>
              <Label htmlFor='name'>نام</Label>
              <Input
                id='name'
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder='نام خود را وارد کنید'
              />
            </div>
            <div className='flex flex-col gap-1'>
              <Label htmlFor='phone'>شماره همراه</Label>
              <Input
                id='phone'
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder='شماره همراه خود را وارد کنید'
              />
            </div>
            <div className='flex flex-col gap-1'>
              <Label htmlFor='password'>رمزعبور</Label>
              <div className='flex gap-2'>
                <Input
                  id='password'
                  type={formData.showPassword ? "text" : "password"}
                  placeholder='رمز عبور خود را وارد کنید'
                  className='w-full'
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
                <Button
                  variant='outline'
                  size={"icon"}
                  onClick={() =>
                    setFormData({
                      ...formData,
                      showPassword: !formData.showPassword,
                    })
                  }
                >
                  {formData.showPassword ? <EyeClosed /> : <Eye />}
                </Button>
              </div>
            </div>
            <div className='flex flex-col gap-1'>
              <Label htmlFor='confirmPassword'>تأیید رمزعبور</Label>
              <div className='flex gap-2'>
                <Input
                  id='confirmPassword'
                  type={formData.showConfirmPassword ? "text" : "password"}
                  placeholder='تأیید رمز عبور خود را وارد کنید'
                  className='w-full'
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                />
                <Button
                  variant='outline'
                  size={"icon"}
                  onClick={() =>
                    setFormData({
                      ...formData,
                      showConfirmPassword: !formData.showConfirmPassword,
                    })
                  }
                >
                  {formData.showConfirmPassword ? <EyeClosed /> : <Eye />}
                </Button>
              </div>
            </div>
            {otpSent && (
              <div className='flex flex-col gap-1'>
                <Label htmlFor='otp'>کد تایید</Label>
                <Input
                  id='otp'
                  value={formData.otp}
                  onChange={(e) =>
                    setFormData({ ...formData, otp: e.target.value })
                  }
                  placeholder='کد تایید را وارد کنید'
                  autoComplete='one-time-code'
                />
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className='flex flex-col gap-2'>
          {otpSent ? (
            <Button className='w-full' variant='default' onClick={onRegister}>
              ثبت نام
            </Button>
          ) : (
            <Button
              className='w-full'
              variant='default'
              onClick={() => {
                onSendOTP();
              }}
            >
              ارسال کد تایید
            </Button>
          )}

          <Link href='/login' className='w-full'>
            <Button className='w-full' variant='link'>
              حساب کاربری دارید؟ ورود
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
