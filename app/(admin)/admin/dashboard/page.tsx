// src/app/admin/dashboard/page.tsx
import { IsAuthenticatedAdmin } from "@/auth/AuthFunctions";
import AdminDashboardClient, {
  type AdminDashboardData,
} from "@/components/admin/dashboard/AdminDashboardClient";
import { prisma } from "@/prisma/prisma";
import { unstable_noStore as noStore } from "next/cache";
import { headers } from "next/headers";

function isoDayUTC(d: Date) {
  return d.toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
}

function isoHourUTCLabel(d: Date) {
  // Matches SQL format: 'YYYY-MM-DD HH24:00'
  return d.toISOString().slice(0, 13).replace("T", " ") + ":00";
}

async function getDashboardData(): Promise<AdminDashboardData | null> {
  const user = await IsAuthenticatedAdmin();
  if (!user) return null;

  const now = new Date();

  // Daily windows
  const from30 = new Date(now);
  from30.setUTCDate(from30.getUTCDate() - 29);
  from30.setUTCHours(0, 0, 0, 0);

  const from7 = new Date(now);
  from7.setUTCDate(from7.getUTCDate() - 6);
  from7.setUTCHours(0, 0, 0, 0);

  // Hourly window (last 24 hours including current hour)
  const from24h = new Date(now);
  from24h.setUTCHours(from24h.getUTCHours() - 23, 0, 0, 0);

  const [
    usersTotal,
    usersNew30,
    chatsTotal,
    messagesTotal,
    tasksTotal,
    feedbackTotal,
    notificationsTotal,
    notificationsUnread,
    transactionsTotal,
    transactionsPending,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: from30 } } }),
    prisma.chat.count(),
    prisma.message.count(),
    prisma.userTask.count(),
    prisma.feedback.count(),
    prisma.notification.count(),
    prisma.notification.count({ where: { isRead: false } }),
    prisma.transaction.count(),
    prisma.transaction.count({ where: { status: "pending" } }),
  ]);

  // -----------------------
  // DAILY: Users (30d)
  // -----------------------
  const usersPerDay = await prisma.$queryRaw<
    Array<{ day: string; count: number }>
  >`
    SELECT
      to_char(date_trunc('day', "createdAt" AT TIME ZONE 'UTC'), 'YYYY-MM-DD') AS day,
      count(*)::int AS count
    FROM "User"
    WHERE "createdAt" >= ${from30}
    GROUP BY 1
    ORDER BY 1;
  `;

  // -----------------------
  // DAILY: Messages by role (7d)
  // -----------------------
  const messagesPerDayByRole = await prisma.$queryRaw<
    Array<{ day: string; role: string; count: number }>
  >`
    SELECT
      to_char(date_trunc('day', "createdAt" AT TIME ZONE 'UTC'), 'YYYY-MM-DD') AS day,
      "role" AS role,
      count(*)::int AS count
    FROM "Message"
    WHERE "createdAt" >= ${from7}
    GROUP BY 1, 2
    ORDER BY 1, 2;
  `;

  // -----------------------
  // DAILY: Revenue (30d)
  // -----------------------
  const revenuePerDay = await prisma.$queryRaw<
    Array<{ day: string; revenue: number; completed: number; failed: number }>
  >`
    SELECT
      to_char(date_trunc('day', "createdAt" AT TIME ZONE 'UTC'), 'YYYY-MM-DD') AS day,
      COALESCE(sum("amount") FILTER (WHERE "status" = 'completed'), 0)::float AS revenue,
      count(*) FILTER (WHERE "status" = 'completed')::int AS completed,
      count(*) FILTER (WHERE "status" = 'failed')::int AS failed
    FROM "Transaction"
    WHERE "createdAt" >= ${from30}
    GROUP BY 1
    ORDER BY 1;
  `;

  // -----------------------
  // HOURLY: Users (24h)
  // -----------------------
  const usersPerHour = await prisma.$queryRaw<
    Array<{ hour: string; count: number }>
  >`
    SELECT
      to_char(date_trunc('hour', "createdAt" AT TIME ZONE 'UTC'), 'YYYY-MM-DD HH24:00') AS hour,
      count(*)::int AS count
    FROM "User"
    WHERE "createdAt" >= ${from24h}
    GROUP BY 1
    ORDER BY 1;
  `;

  // -----------------------
  // HOURLY: Messages by role (24h)
  // -----------------------
  const messagesPerHourByRole = await prisma.$queryRaw<
    Array<{ hour: string; role: string; count: number }>
  >`
    SELECT
      to_char(date_trunc('hour', "createdAt" AT TIME ZONE 'UTC'), 'YYYY-MM-DD HH24:00') AS hour,
      "role" AS role,
      count(*)::int AS count
    FROM "Message"
    WHERE "createdAt" >= ${from24h}
    GROUP BY 1, 2
    ORDER BY 1, 2;
  `;

  // -----------------------
  // HOURLY: Revenue (24h)
  // -----------------------
  const revenuePerHour = await prisma.$queryRaw<
    Array<{ hour: string; revenue: number; completed: number; failed: number }>
  >`
    SELECT
      to_char(date_trunc('hour', "createdAt" AT TIME ZONE 'UTC'), 'YYYY-MM-DD HH24:00') AS hour,
      COALESCE(sum("amount") FILTER (WHERE "status" = 'completed'), 0)::float AS revenue,
      count(*) FILTER (WHERE "status" = 'completed')::int AS completed,
      count(*) FILTER (WHERE "status" = 'failed')::int AS failed
    FROM "Transaction"
    WHERE "createdAt" >= ${from24h}
    GROUP BY 1
    ORDER BY 1;
  `;

  // Distributions (same as your original)
  const taskStatus = await prisma.userTask.groupBy({
    by: ["status"],
    _count: { _all: true },
  });

  const taskPriority = await prisma.userTask.groupBy({
    by: ["priority"],
    _count: { _all: true },
  });

  const feedbackTypes = await prisma.feedback.groupBy({
    by: ["type"],
    _count: { _all: true },
  });

  const transactionStatus = await prisma.transaction.groupBy({
    by: ["status"],
    _count: { _all: true },
    _sum: { amount: true },
  });

  const activeSubsByName = await prisma.$queryRaw<
    Array<{ name: string; count: number }>
  >`
    SELECT s."name" AS name, count(*)::int AS count
    FROM "UserSubscription" us
    JOIN "Subscription" s ON s."id" = us."subscriptionId"
    WHERE us."isActive" = true
      AND (us."endDate" IS NULL OR us."endDate" > now())
    GROUP BY 1
    ORDER BY count(*) DESC, name ASC;
  `;

  const topExams = await prisma.$queryRaw<
    Array<{ examId: string; name: string; count: number }>
  >`
    SELECT e."id" AS "examId", e."name" AS name, count(*)::int AS count
    FROM "UserExamResult" uer
    JOIN "Exam" e ON e."id" = uer."examId"
    WHERE uer."createdAt" >= ${from30}
    GROUP BY 1, 2
    ORDER BY count(*) DESC
    LIMIT 8;
  `;

  const recentTransactions = await prisma.transaction.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    include: {
      user: { select: { id: true, name: true, phone: true } },
      subscription: { select: { id: true, name: true } },
    },
  });

  const recentFeedback = await prisma.feedback.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    include: {
      user: { select: { id: true, name: true, phone: true } },
    },
  });

  // -----------------------
  // Normalize DAILY series
  // -----------------------
  const allDays30: string[] = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date(from30);
    d.setUTCDate(d.getUTCDate() + i);
    allDays30.push(isoDayUTC(d));
  }

  const usersMapDay = new Map(usersPerDay.map((r) => [r.day, r.count]));
  const revenueMapDay = new Map(revenuePerDay.map((r) => [r.day, r]));

  const usersSeriesDaily30 = allDays30.map((day) => ({
    bucket: day,
    users: usersMapDay.get(day) ?? 0,
  }));

  const revenueSeriesDaily30 = allDays30.map((day) => {
    const row = revenueMapDay.get(day);
    return {
      bucket: day,
      revenue: row?.revenue ?? 0,
      completed: row?.completed ?? 0,
      failed: row?.failed ?? 0,
    };
  });

  const allDays7: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(from7);
    d.setUTCDate(d.getUTCDate() + i);
    allDays7.push(isoDayUTC(d));
  }

  const msgKeyDay = (day: string, role: string) => `${day}__${role}`;
  const msgMapDay = new Map(
    messagesPerDayByRole.map((r) => [msgKeyDay(r.day, r.role), r.count]),
  );

  const messagesSeriesDaily7 = allDays7.map((day) => ({
    bucket: day,
    user: msgMapDay.get(msgKeyDay(day, "user")) ?? 0,
    assistant: msgMapDay.get(msgKeyDay(day, "assistant")) ?? 0,
    system: msgMapDay.get(msgKeyDay(day, "system")) ?? 0,
  }));

  // -----------------------
  // Normalize HOURLY series (24h)
  // -----------------------
  const allHours24: string[] = [];
  for (let i = 0; i < 24; i++) {
    const d = new Date(from24h);
    d.setUTCHours(d.getUTCHours() + i, 0, 0, 0);
    allHours24.push(isoHourUTCLabel(d));
  }

  const usersMapHour = new Map(usersPerHour.map((r) => [r.hour, r.count]));
  const revenueMapHour = new Map(revenuePerHour.map((r) => [r.hour, r]));

  const usersSeriesHourly24 = allHours24.map((hour) => ({
    bucket: hour,
    users: usersMapHour.get(hour) ?? 0,
  }));

  const revenueSeriesHourly24 = allHours24.map((hour) => {
    const row = revenueMapHour.get(hour);
    return {
      bucket: hour,
      revenue: row?.revenue ?? 0,
      completed: row?.completed ?? 0,
      failed: row?.failed ?? 0,
    };
  });

  const msgKeyHour = (hour: string, role: string) => `${hour}__${role}`;
  const msgMapHour = new Map(
    messagesPerHourByRole.map((r) => [msgKeyHour(r.hour, r.role), r.count]),
  );

  const messagesSeriesHourly24 = allHours24.map((hour) => ({
    bucket: hour,
    user: msgMapHour.get(msgKeyHour(hour, "user")) ?? 0,
    assistant: msgMapHour.get(msgKeyHour(hour, "assistant")) ?? 0,
    system: msgMapHour.get(msgKeyHour(hour, "system")) ?? 0,
  }));

  return {
    range: {
      from30: from30.toISOString(),
      from7: from7.toISOString(),
      from24h: from24h.toISOString(),
      now: now.toISOString(),
    },
    kpis: {
      usersTotal,
      usersNew30,
      chatsTotal,
      messagesTotal,
      tasksTotal,
      feedbackTotal,
      notificationsTotal,
      notificationsUnread,
      transactionsTotal,
      transactionsPending,
    },
    series: {
      usersSeriesDaily30,
      revenueSeriesDaily30,
      messagesSeriesDaily7,
      usersSeriesHourly24,
      revenueSeriesHourly24,
      messagesSeriesHourly24,
    },
    distributions: {
      taskStatus: taskStatus.map((x) => ({ name: x.status, value: x._count._all })),
      taskPriority: taskPriority.map((x) => ({ name: x.priority, value: x._count._all })),
      feedbackTypes: feedbackTypes.map((x) => ({ name: x.type, value: x._count._all })),
      transactionStatus: transactionStatus.map((x) => ({
        name: x.status,
        value: x._count._all,
        amountSum: x._sum.amount ?? 0,
      })),
      activeSubsByName: activeSubsByName.map((x) => ({ name: x.name, value: x.count })),
      topExams: topExams.map((x) => ({ name: x.name, value: x.count })),
      notifications: [
        { name: "Unread", value: notificationsUnread },
        { name: "Read", value: Math.max(0, notificationsTotal - notificationsUnread) },
      ],
    },
    recent: {
      transactions: recentTransactions.map((t) => ({
        id: t.id,
        createdAt: t.createdAt.toISOString(),
        status: t.status,
        amount: t.amount,
        transactionId: t.transactionId,
        zibalStatus: t.zibalStatus ?? null,
        user: t.user,
        subscription: t.subscription,
      })),
      feedback: recentFeedback.map((f) => ({
        id: f.id,
        createdAt: f.createdAt.toISOString(),
        type: f.type,
        message: f.message,
        answer: f.answer ?? null,
        user: f.user,
      })),
    },
  };
}

export default async function AdminDashboardPage() {
  headers();
  noStore();

  const data = await getDashboardData();

  if (!data) {
    return (
      <div className='w-full h-full flex items-center justify-center'>
        <p>شما دسترسی به این صفحه را ندارید</p>
      </div>
    );
  }

  return (
    <div className='p-4 md:p-6'>
      <AdminDashboardClient data={data} />
    </div>
  );
}
