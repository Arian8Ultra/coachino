"use client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Subscription_GetById } from "@/prisma/functions/Subscription/SubFun";
import { User_GetAll } from "@/prisma/functions/User/UserFun";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";

interface Props {
  users: User_GetAll;
  subscription: Subscription_GetById;
}
const AssignSubModal = ({ users, subscription }: Props) => {
  const router = useRouter();
  const [selectedUserIds, setSelectedUserIds] = React.useState<string[]>([]);

  const handleCheckboxChange = (userId: string) => {
    setSelectedUserIds((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUserIds.length === 0) {
      toast.error("لطفاً حداقل یک کاربر را انتخاب کنید");
      return;
    }
    const res = await fetch("/api/admin/subscriptions/assign", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userIds: selectedUserIds,
        subscriptionId: subscription.id,
      }),
    });
    if (res.ok) {
      toast.success("اشتراک با موفقیت اختصاص داده شد");
      router.refresh();
    } else {
      toast.error("خطا در اختصاص اشتراک");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='accent' className='w-fit'>
          اختصاص اشتراک
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[600px] max-h-[80vh] overflow-y-auto rtl'>
        <DialogHeader className='sticky top-0 bg-glass backdrop-blur-md p-3 rounded-lg border'>
          <DialogTitle className='text-center'>
            اختصاص اشتراک {subscription.name}
          </DialogTitle>
        </DialogHeader>
        <form className='grid gap-4 py-4' onSubmit={handleSubmit}>
          <div className='grid gap-2'>
            <div className='grid gap-1'>
              <Label>انتخاب کاربران</Label>
              {/* a button for selecting all users */}
              <Button
                variant='outline'
                type='button'
                className='w-fit'
                onClick={() => {
                  setSelectedUserIds(users.map((user) => user.id));
                }}
              >
                انتخاب همه
              </Button>
              <div className='max-h-60 overflow-y-auto border rounded-md p-2 flex flex-col gap-2'>
                {users.map((user) => (
                  <div
                    key={user.id}
                    className='flex items-center gap-2 p-2 border rounded hover:bg-glass/50'
                  >
                    <Checkbox
                      id={user.id}
                      checked={selectedUserIds.includes(user.id)}
                      onCheckedChange={() => handleCheckboxChange(user.id)}
                    />
                    <Label htmlFor={user.id} className='cursor-pointer'>
                      {user.name} ({user.phone})
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <Button type='submit' className='w-fit'>
            اختصاص اشتراک
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AssignSubModal;
