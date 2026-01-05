// src/lib/cron/jobs/taskReminder.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { cron } from "@/lib/cron";
import { sendSms } from "@/lib/kavenegar";
import { prisma } from "@/prisma/prisma";
import { ensureScheduleJob } from "@/lib/cron/ensureJob";

const taskReminderRule = new cron.RecurrenceRule();
taskReminderRule.tz = "Asia/Tehran";
taskReminderRule.minute = 0; // Runs every hour at minute 0

const oneHourReminderMessages = (taskTitle: string) => [
  `یادآوری دوستانه: فقط یک ساعت تا سررسید تسک «${taskTitle}» مونده. اگه لازمه، از همین الان یه قدم کوچیک بردار.\n\ncoachino.me`,
  `وقتشه یه نگاه بندازی: تسک «${taskTitle}» تا یک ساعت دیگه سررسید می‌شه. تو از پسش برمیای!\n\ncoachino.me`,
  `فراموش نشه: تسک «${taskTitle}» در یک ساعت آینده موعدش می‌رسه. آماده‌ای؟\n\ncoachino.me`,
  `یه تلنگر کوچیک: «${taskTitle}» تا یک ساعت دیگه سررسید می‌شه. اگه شروع کنی، نصف راهی!\n\ncoachino.me`,
  `سلام! فقط یک ساعت تا «${taskTitle}» مونده. اگه ۱۰ دقیقه روش وقت بذاری، خیلی جلو می‌افتی.\n\ncoachino.me`,
];

const oneDayReminderMessages = (taskTitle: string) => [
  `یادآوری دوستانه: تسک «${taskTitle}» فردا سررسید می‌شه. امروز یه قدم کوچیک برداری، فردا راحت‌تری.\n\ncoachino.me`,
  `فردا موعد «${taskTitle}» هست. اگر ۱۵ دقیقه امروز براش بذاری، کلی جلو می‌افتی.\n\ncoachino.me`,
  `فراموش نشه: «${taskTitle}» فردا سررسید می‌شه. برنامه‌ات رو یه کم تنظیم کن که خیالت راحت باشه.\n\ncoachino.me`,
  `سلام! تسک «${taskTitle}» فردا موعدشه. اگر لازمه، همین امروز یه مرور سریع انجام بده.\n\ncoachino.me`,
  `تلنگر کوچیک: «${taskTitle}» فردا موعدشه. امروز یه شروع کوچیک، فردا یه پایان خوب.\n\ncoachino.me`,
];

const pickRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)] ?? arr[0]!;

export function registerTaskReminderJobs() {
  // 1) Hourly job
  ensureScheduleJob("task-reminder-hourly", taskReminderRule, async () => {
    console.log("Running Task Reminder Cron Job - Hourly");

    const now = new Date();
    const upcomingTasks = await prisma.userTask.findMany({
      where: {
        dueDate: {
          gte: now,
          lt: new Date(now.getTime() + 60 * 60 * 1000),
        },
        status: "PENDING",
      },
      include: { user: true },
    });

    for (const task of upcomingTasks) {
      const message = pickRandom(oneHourReminderMessages(task.title));

      await prisma.notification.create({
        data: {
          title: "یادآوری تسک",
          message,
          dueDate: task.dueDate,
          isRead: false,
          hasReminder: false,
          userId: task.userId,
        },
      });

      sendSms(
        task.user.phone,
        `یادآوری: «${task.title}» تا یک ساعت دیگه سررسید می‌شه. موفق باشی.`,
      );
    }
  });

  // 2) Daily job
  ensureScheduleJob(
    "task-reminder-daily",
    { hour: 9, minute: 0, tz: "Asia/Tehran" },
    async () => {
      console.log("Running Task Reminder Cron Job - Daily at 9 AM");

      const now = new Date();
      const nextDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

      const upcomingTasks = await prisma.userTask.findMany({
        where: {
          dueDate: {
            gte: nextDay,
            lt: new Date(nextDay.getTime() + 24 * 60 * 60 * 1000),
          },
          status: "PENDING",
        },
        include: { user: true },
      });

      for (const task of upcomingTasks) {
        const message = pickRandom(oneDayReminderMessages(task.title));

        await prisma.notification.create({
          data: {
            title: "یادآوری تسک",
            message,
            dueDate: task.dueDate,
            isRead: false,
            hasReminder: false,
            userId: task.userId,
          },
        });

        sendSms(
          task.user.phone,
          `یادآوری: «${task.title}» فردا سررسید می‌شه. امروز اگر فرصت داری یه مقدار جلو ببر.`,
        );
      }
    },
  );
}
