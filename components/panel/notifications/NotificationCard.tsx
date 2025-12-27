"use client";
import { Notification } from "@/generated/prisma";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface Props {
  notification: Notification;
}
const NotificationCard = ({ notification }: Props) => {
  const router = useRouter();
  const handleRead = () => {
    const readNotification = async (id: string) => {
      const response = await fetch(`/api/notification/read?id=${id}`, {
        method: "GET",
      });
      if (!response.ok) {
        toast.error("خطا در علامت گذاری اعلان به عنوان خوانده شده.");
        return;
      }
      router.refresh();
    };
    toast.promise(readNotification(notification.id), {
      loading: "در حال علامت گذاری به عنوان خوانده شده...",
      success: "اعلان به عنوان خوانده شده علامت گذاری شد!",
      error: "خطا در علامت گذاری اعلان به عنوان خوانده شده.",
    });
  };

  return (
    <Card
      className={`bg-glass/50 backdrop-blur-md ${
        !notification.isRead ? "border-2 border-blue-500" : "opacity-70"
      }`}
    >
      <CardContent className='flex flex-col gap-2'>
        <h3 className='font-semibold text-lg mb-2'>{notification.title}</h3>
        <p className='text-sm text-muted-foreground'>{notification.message}</p>
        {notification.dueDate && (
          <p className='text-xs text-muted-foreground mt-2'>
            تاریخ یادآوری:{" "}
            {new Date(notification.dueDate).toLocaleDateString("fa-IR")}
          </p>
        )}
        {!notification.isRead && (
          <Button variant='outline' onClick={handleRead}>
            خوانده شده
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationCard;
