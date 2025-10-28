import { cron } from "@/lib/cron";
import { sendSms } from "@/lib/kavenegar";
import { prisma } from "@/prisma/prisma";

export async function Notification_Create(
  data: {
    title: string;
    message: string;
    dueDate?: Date;
    hasReminder?: boolean;
  },
  userId: string,
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) throw new Error("User not found");
  const notification = await prisma.notification.create({
    data: {
      title: data.title,
      message: data.message,
      dueDate: data.dueDate,
      isRead: false,
      hasReminder: data.hasReminder,
      userId,
    },
  });

  if (data.hasReminder && data.dueDate) {
    cron.scheduleJob(data.dueDate, async () => {
      sendSms(user.phone, `${data.title}\n\n${data.message}`);
    });
    // after 1 minute after dueDate, mark notification as read
    const markAsReadDate = new Date(data.dueDate.getTime() + 1 * 60 * 1000);
    cron.scheduleJob(markAsReadDate, async () => {
      await prisma.notification.updateMany({
        where: { id: notification.id, userId },
        data: { isRead: true },
      });
    });
  }

  return notification;
}
export type Notification_Create = Awaited<
  ReturnType<typeof Notification_Create>
>;

export async function Notification_MarkAsRead(
  notificationId: string,
  userId: string,
) {
  const notification = await prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { isRead: true },
  });
  return notification;
}
export type Notification_MarkAsRead = Awaited<
  ReturnType<typeof Notification_MarkAsRead>
>;

export async function Notification_GetAll(userId: string) {
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return notifications;
}
export type Notification_GetAll = Awaited<
  ReturnType<typeof Notification_GetAll>
>;
