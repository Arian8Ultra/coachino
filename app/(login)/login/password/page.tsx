"use client";
import Logo from "@/assets/CoachinoWithText.svg";
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
import { Eye, EyeClosed } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    phone: "",
    password: "",
    showPassword: false,
  });
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/panel";
  const onLogin = async () => {
    const res = await fetch("/api/auth/login", {
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
      router.push(redirectTo || "/panel");
      return;
    } else {
      const errorData = await res.json();
      console.error("Login failed:", errorData);
      toast.error(`ورود ناموفق: ${errorData.error || "خطای ناشناخته"}`);
    }
  };

  return (
    <div className='relative flex md:items-center items-end-safe justify-center w-auto md:p-20 m-2 rounded-lg md:bg-background/70'>
      {/* <Image
        src={Pattern}
        alt='Nexiino Pattern'
        width={1000}
        height={1000}
        className='absolute top-0 left-0 w-full h-full object-cover opacity-10 md:block hidden rounded-lgD'
      /> */}

      <Card className='md:w-fit w-auto p-2 md:min-w-xl backdrop-blur-md bg-white/50 dark:bg-stone-900/60 m-3'>
        <CardHeader>
          <Image
            src={Logo}
            alt='Coachino Logo'
            width={1000}
            height={1000}
            className='w-1/3 dark:invert-0 invert mx-auto mb-2 md:hidden'
          />
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
            <div className='flex flex-col gap-1'>
              <Label htmlFor='password'>رمز عبور</Label>
              <div className='flex gap-2'>
                <Input
                  id='password'
                  type={form.showPassword ? "text" : "password"}
                  placeholder='رمز عبور خود را وارد کنید'
                  className='w-full'
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />
                <Button
                  variant='outline'
                  onClick={() =>
                    setForm({ ...form, showPassword: !form.showPassword })
                  }
                >
                  {form.showPassword ? <EyeClosed /> : <Eye />}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className='flex flex-col gap-2'>
          {/* <Link href='/' className='w-full'> */}
          <Button className='w-full' variant='default' onClick={onLogin}>
            ورود
          </Button>
          {/* </Link>  */}
          <div className='grid grid-cols-2 w-full'>
            <Link href='/login' className='w-full'>
              <Button className='w-full' variant='link'>
                ورود با رمز یکبار مصرف
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
