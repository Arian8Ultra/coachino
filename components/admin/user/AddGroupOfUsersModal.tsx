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
import { Textarea } from "@/components/ui/textarea";
const AddGroupOfUsersModal = () => {
  const [users, setUsers] = React.useState<
    {
      name: string;
      phone: string;
    }[]
  >([]);
  const [sendSms, setSendSms] = React.useState<boolean>(false);
  const [inviteMode, setInviteMode] = React.useState<boolean>(false);
  const [csv, setCsv] = React.useState<string>("");

  const parseCsv = (csvString: string) => {
    const lines = csvString.split("\n");
    const parsedUsers: { name: string; phone: string }[] = [];
    for (const line of lines) {
      const [name, phone] = line.split(",").map((item) => item.trim());
      if (name && phone) {
        parsedUsers.push({ name, phone });
      }
    }
    return parsedUsers;
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>افزودن گروهی کاربران</Button>
      </DialogTrigger>
      <DialogContent className='max-w-lg max-h-[80vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>افزودن گروهی کاربران</DialogTitle>
        </DialogHeader>
        <div className='flex flex-col gap-4'>
          <Label htmlFor='csv-input' className='font-bold'>
            وارد کردن از طریق CSV (نام،شماره همراه)
          </Label>
          <Textarea
            id='csv-input'
            placeholder='مثال: علی رضایی,09121234567'
            value={csv}
            onChange={(e) => {
              setCsv(e.target.value);
              const parsed = parseCsv(e.target.value);
              setUsers(parsed);
            }}
            className='mb-4'
            rows={5}
          />
          <Button variant='outline' onClick={() => {
            const parsed = parseCsv(csv);
            setUsers(parsed);
          }}>بارگذاری از CSV</Button>
          <Label className='font-bold'>لیست کاربران</Label>
          
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
          <div className='flex items-center gap-2'>
            <input
              type='checkbox'
              id='invite-mode'
              checked={inviteMode}
              onChange={(e) => setInviteMode(e.target.checked)}
              disabled={!sendSms}
            />
            <Label htmlFor='invite-mode'>ارسال پیامک دعوتنامه</Label>
          </div>
          <Button
            className='mt-4'
            onClick={async () => {
              const response = await fetch("/api/admin/users/group", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ users, send_sms: sendSms, invite_mode: inviteMode }),
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
