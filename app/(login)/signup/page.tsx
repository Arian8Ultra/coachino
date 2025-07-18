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
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function SignupPage() {
  // const { password, confirmPassword, phone, name } = body;
  const [formData, setFormData] = useState({
    phone: "",
    password: "",
    confirmPassword: "",
    name: "",
    showPassword: false,
    showConfirmPassword: false,
  });

  const router = useRouter();

  const onRegister = async () => {
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
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
      }),
    });

    if (res.ok) {
      const data = await res.json();
      console.log("Registration successful:", data);
      toast.success("Registration successful! Please login.");
      router.push("/login"); // Redirect to login page after successful registration
    } else {
      const errorData = await res.json();
      console.error("Registration failed:", errorData);
      toast.error(`Registration failed: ${errorData.error || "Unknown error"}`);
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
          <CardTitle className='text-center text-2xl'>SignUp</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col gap-4'>
            <div className='flex flex-col gap-1'>
              <Label htmlFor='name'>Name</Label>
              <Input
                id='name'
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder='Enter your name'
              />
            </div>
            <div className='flex flex-col gap-1'>
              <Label htmlFor='phone'>Phone</Label>
              <Input
                id='phone'
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder='Enter your phone number'
              />
            </div>
            <div className='flex flex-col gap-1'>
              <Label htmlFor='password'>Password</Label>
              <div className='flex gap-2'>
                <Input
                  id='password'
                  type={formData.showPassword ? "text" : "password"}
                  placeholder='Enter your password'
                  className='w-full'
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
                <Button
                  variant='outline'
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
              <Label htmlFor='confirmPassword'>Confirm Password</Label>
              <div className='flex gap-2'>
                <Input
                  id='confirmPassword'
                  type={formData.showConfirmPassword ? "text" : "password"}
                  placeholder='Confirm your password'
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
          </div>
        </CardContent>
        <CardFooter className='flex flex-col gap-2'>
          <Button className='w-full' variant='default' onClick={onRegister}>
            Register
          </Button>
          <Link href='/login' className='w-full'>
            <Button className='w-full' variant='link'>
              Already have an account? Login
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
