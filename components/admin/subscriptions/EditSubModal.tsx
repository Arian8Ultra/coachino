/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { SubscriptionOptionEnum } from "@/generated/prisma";
import React from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Subscription_GetById } from "@/prisma/functions/Subscription/SubFun";
import { Edit } from "lucide-react";
import { DynamicIcon, iconNames } from "lucide-react/dynamic";

interface Props {
  subscription: Subscription_GetById;
}
const EditSubModal = ({ subscription }: Props) => {
  // data: {
  //     name: string;
  //     id: string;
  //     createdAt: Date;
  //     updatedAt: Date;
  //     description: string | null;
  //     isActive: boolean;
  //     options: $Enums.SubscriptionOptionEnum[];
  //     duration: number;
  //     chatsPerMonth: number;
  //     tasksPerMonth: number;
  //     scenariosPerMonth: number;
  //     price: number;
  //     level: number;
  // }
  const [input, setInput] = React.useState<{
    name: string;
    description: string;
    isActive: boolean;
    options: SubscriptionOptionEnum[];
    duration: number;
    chatsPerMonth: number;
    tasksPerMonth: number;
    iconName?: string;
    backgroundUrl?: string;
    scenariosPerMonth: number;
    price: number;
    level: number;
  }>({
    name: subscription.name,
    description: subscription.description || "",
    isActive: subscription.isActive,
    options: subscription.options,
    duration: subscription.duration,
    chatsPerMonth: subscription.chatsPerMonth,
    tasksPerMonth: subscription.tasksPerMonth,
    scenariosPerMonth: subscription.scenariosPerMonth,
    price: subscription.price,
    level: subscription.level,
    iconName: subscription.iconName || undefined,
    backgroundUrl: subscription.backgroundUrl || undefined,
  });
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/subscriptions", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...input, id: subscription.id }),
    });
    if (res.ok) {
      toast.success("اشتراک با موفقیت اضافه شد");
      router.refresh();
    } else {
      toast.error("خطا در اضافه کردن اشتراک");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='outline' size={"icon"}>
          <Edit size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px] max-h-[80vh] overflow-y-auto rtl'>
        <DialogHeader className='sticky top-0 bg-glass backdrop-blur-md p-3 rounded-lg border'>
          <DialogTitle className='text-center'>ویرایش اشتراک</DialogTitle>
        </DialogHeader>
        <form className='grid gap-4 py-4' onSubmit={handleSubmit}>
          <div className='grid gap-2'>
            <div className='grid gap-1'>
              <Label htmlFor='name'>نام اشتراک</Label>
              <Input
                id='name'
                placeholder='نام اشتراک'
                className='w-full'
                value={input.name}
                onChange={(e) => setInput({ ...input, name: e.target.value })}
                required
              />
            </div>
            <div className='grid gap-1'>
              <Label htmlFor='description'>توضیحات اشتراک</Label>
              <Textarea
                id='description'
                placeholder='توضیحات اشتراک'
                className='w-full'
                value={input.description}
                onChange={(e) =>
                  setInput({ ...input, description: e.target.value })
                }
                required
              />
            </div>
            <div className='grid gap-1'>
              <Label htmlFor='duration'>مدت زمان (ماه)</Label>
              <Input
                type='number'
                id='duration'
                placeholder='مدت زمان (ماه)'
                className='w-full'
                value={input.duration}
                onChange={(e) =>
                  setInput({ ...input, duration: parseInt(e.target.value) })
                }
                required
              />
            </div>
            <div className='grid gap-1'>
              <Label htmlFor='chatsPerMonth'>تعداد چت در ماه</Label>
              <Input
                type='number'
                id='chatsPerMonth'
                placeholder='تعداد چت در ماه'
                className='w-full'
                value={input.chatsPerMonth}
                onChange={(e) =>
                  setInput({
                    ...input,
                    chatsPerMonth: parseInt(e.target.value),
                  })
                }
                required
              />
            </div>
            <div className='grid gap-1'>
              <Label htmlFor='tasksPerMonth'>تعداد تسک در ماه</Label>
              <Input
                type='number'
                id='tasksPerMonth'
                placeholder='تعداد تسک در ماه'
                className='w-full'
                value={input.tasksPerMonth}
                onChange={(e) =>
                  setInput({
                    ...input,
                    tasksPerMonth: parseInt(e.target.value),
                  })
                }
                required
              />
            </div>
            <div className='grid gap-1'>
              <Label htmlFor='scenariosPerMonth'>تعداد سناریو در ماه</Label>
              <Input
                type='number'
                id='scenariosPerMonth'
                placeholder='تعداد سناریو در ماه'
                className='w-full'
                value={input.scenariosPerMonth}
                onChange={(e) =>
                  setInput({
                    ...input,
                    scenariosPerMonth: parseInt(e.target.value),
                  })
                }
                required
              />
            </div>
            <div className='grid gap-1'>
              <Label htmlFor='price'>قیمت (تومان)</Label>
              <Input
                type='number'
                id='price'
                placeholder='قیمت (تومان)'
                className='w-full'
                value={input.price}
                onChange={(e) =>
                  setInput({ ...input, price: parseInt(e.target.value) })
                }
                required
              />
            </div>
            <div className='grid gap-1'>
              <Label htmlFor='level'>سطح اشتراک</Label>
              <Input
                type='number'
                id='level'
                placeholder='سطح اشتراک'
                className='w-full'
                value={input.level}
                onChange={(e) =>
                  setInput({ ...input, level: parseInt(e.target.value) })
                }
                required
              />
            </div>
            <div className='grid gap-1'>
              <Label htmlFor='iconName'>آیکون اشتراک</Label>
              <Input
                type='text'
                id='iconName'
                placeholder='آیکون اشتراک'
                className='w-full'
                value={input.iconName}
                onChange={(e) =>
                  setInput({ ...input, iconName: e.target.value })
                }
              />
              {iconNames.includes(input.iconName as any) ? (
                <DynamicIcon
                  name={(input.iconName as any) || "alert-circle"}
                  size={24}
                />
              ) : (
                <p className='text-sm text-red-500'>
                  نام آیکون نامعتبر است. لطفا یکی از نام‌های آیکون‌های
                  lucide-react را وارد کنید.
                  
                </p>
              )}
            </div>
            <div className='grid gap-1'>
              <Label htmlFor='backgroundUrl'>پس‌زمینه اشتراک</Label>
              <Input
                type='text'
                id='backgroundUrl'
                placeholder='پس‌زمینه اشتراک'
                className='w-full'
                value={input.backgroundUrl}
                onChange={(e) =>
                  setInput({ ...input, backgroundUrl: e.target.value })
                }
              />
            </div>
            <div className='grid gap-1'>
              <Label htmlFor='options'>گزینه‌ها (با کاما جدا کنید)</Label>
              <div className='flex flex-col gap-5'>
                {Object.values(SubscriptionOptionEnum).map((option) => (
                  <div key={option} className='flex items-center gap-2'>
                    <Checkbox
                      id={option}
                      checked={input.options.includes(option)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setInput({
                            ...input,
                            options: [...input.options, option],
                          });
                        } else {
                          setInput({
                            ...input,
                            options: input.options.filter((o) => o !== option),
                          });
                        }
                      }}
                    />
                    <Label htmlFor={option} className='mb-0'>
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <div className='grid gap-1'>
              <Label htmlFor='isActive'>فعال بودن اشتراک</Label>
              <Switch
                id='isActive'
                checked={input.isActive}
                onCheckedChange={(checked) =>
                  setInput({ ...input, isActive: checked })
                }
              />
            </div>
          </div>
          <div className='mt-4 flex justify-end'>
            <Button type='submit'>ویرایش اشتراک</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditSubModal;
