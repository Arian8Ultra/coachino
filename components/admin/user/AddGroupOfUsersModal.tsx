"use client";
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
import { toast } from "sonner";
import { X } from "lucide-react";
const AddGroupOfUsersModal = () => {
  const [users, setUsers] = React.useState<
    {
      name: string;
      phone: string;
    }[]
  >([]);
  const [sendSms, setSendSms] = React.useState<boolean>(false);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>افزودن گروهی کاربران</Button>
      </DialogTrigger>
      <DialogContent className='max-w-lg'>
        <DialogHeader>
          <DialogTitle>افزودن گروهی کاربران</DialogTitle>
        </DialogHeader>
        <div className='flex flex-col gap-4'>
          {users.map((user, index) => (
            <div key={index} className='flex gap-2 items-end'>
              <div className='flex flex-1 flex-col'>
                <Label htmlFor={`name-${index}`}>نام</Label>
                <Input
                  id={`name-${index}`}
                  type='text'
                  placeholder='نام کاربر'
                  value={user.name}
                  onChange={(e) => {
                    const newUsers = [...users];
                    newUsers[index].name = e.target.value;
                    setUsers(newUsers);
                  }}
                />
              </div>
              <div className='flex flex-1 flex-col'>
                <Label htmlFor={`phone-${index}`}>شماره همراه</Label>
                <Input
                  id={`phone-${index}`}
                  type='tel'
                  placeholder='شماره همراه'
                  value={user.phone}
                  onChange={(e) => {
                    const newUsers = [...users];
                    newUsers[index].phone = e.target.value;
                    setUsers(newUsers);
                  }}
                />
              </div>
              <Button
                variant='destructive'
                size={"icon"}
                onClick={() => {
                  const newUsers = users.filter((_, i) => i !== index);
                  setUsers(newUsers);
                }}
              >
                <X />
              </Button>
            </div>
          ))}
          <Button
            variant='outline'
            onClick={() => setUsers([...users, { name: "", phone: "" }])}
          >
            افزودن کاربر دیگر
          </Button>
          <div className='flex items-center gap-2'>
            <input
              type='checkbox'
              id='send-sms'
              checked={sendSms}
              onChange={(e) => setSendSms(e.target.checked)}
            />
            <Label htmlFor='send-sms'>ارسال پیامک به کاربران</Label>
          </div>
          <Button
            className='mt-4'
            onClick={async () => {
              const response = await fetch("/api/admin/users/group", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ users, send_sms: sendSms }),
              });
              if (response.ok) {
                toast.success("کاربران با موفقیت اضافه شدند");
              } else {
                toast.error("خطا در اضافه کردن کاربران");
              }
            }}
          >
            ثبت کاربران
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddGroupOfUsersModal;
