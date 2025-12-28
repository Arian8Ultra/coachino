// src/app/admin/dashboard/page.tsx
import { headers } from "next/headers";
import { unstable_noStore as noStore } from "next/cache";
import AdminDashboardClient, {
  type AdminDashboardData,
} from "@/components/admin/dashboard/AdminDashboardClient";
import { prisma } from "@/prisma/prisma";

function isoDay(d: Date) {
  return d.toISOString().slice(0, 10);
}

async function getDashboardData(): Promise<AdminDashboardData> {
  'use cache';

  const now = new Date();

  const from30 = new Date(now);
  from30.setDate(from30.getDate() - 29);
  from30.setHours(0, 0, 0, 0);

  const from7 = new Date(now);
  from7.setDate(from7.getDate() - 6);
  from7.setHours(0, 0, 0, 0);

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

  const usersPerDay = await prisma.$queryRaw<Array<{ day: string; count: number }>>`
    SELECT to_char(date_trunc('day', "createdAt"), 'YYYY-MM-DD') AS day,
           count(*)::int AS count
    FROM "User"
    WHERE "createdAt" >= ${from30}
    GROUP BY 1
    ORDER BY 1;
  `;

  const messagesPerDayByRole = await prisma.$queryRaw<
    Array<{ day: string; role: string; count: number }>
  >`
    SELECT to_char(date_trunc('day', "createdAt"), 'YYYY-MM-DD') AS day,
           "role" AS role,
           count(*)::int AS count
    FROM "Message"
    WHERE "createdAt" >= ${from7}
    GROUP BY 1, 2
    ORDER BY 1, 2;
  `;

  const revenuePerDay = await prisma.$queryRaw<
    Array<{ day: string; revenue: number; completed: number; failed: number }>
  >`
    SELECT
      to_char(date_trunc('day', "createdAt"), 'YYYY-MM-DD') AS day,
      COALESCE(sum("amount") FILTER (WHERE "status" = 'completed'), 0)::float AS revenue,
      count(*) FILTER (WHERE "status" = 'completed')::int AS completed,
      count(*) FILTER (WHERE "status" = 'failed')::int AS failed
    FROM "Transaction"
    WHERE "createdAt" >= ${from30}
    GROUP BY 1
    ORDER BY 1;
  `;

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

  const activeSubsByName = await prisma.$queryRaw<Array<{ name: string; count: number }>>`
    SELECT s."name" AS name, count(*)::int AS count
    FROM "UserSubscription" us
    JOIN "Subscription" s ON s."id" = us."subscriptionId"
    WHERE us."isActive" = true
      AND (us."endDate" IS NULL OR us."endDate" > now())
    GROUP BY 1
    ORDER BY count(*) DESC, name ASC;
  `;

  const topExams = await prisma.$queryRaw<Array<{ examId: string; name: string; count: number }>>`
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

  // normalize days
  const allDays30: string[] = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date(from30);
    d.setDate(d.getDate() + i);
    allDays30.push(isoDay(d));
  }

  const usersMap = new Map(usersPerDay.map((r) => [r.day, r.count]));
  const revenueMap = new Map(revenuePerDay.map((r) => [r.day, r]));
  const usersSeries30 = allDays30.map((day) => ({ day, users: usersMap.get(day) ?? 0 }));
  const revenueSeries30 = allDays30.map((day) => {
    const row = revenueMap.get(day);
    return {
      day,
      revenue: row?.revenue ?? 0,
      completed: row?.completed ?? 0,
      failed: row?.failed ?? 0,
    };
  });

  const allDays7: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(from7);
    d.setDate(d.getDate() + i);
    allDays7.push(isoDay(d));
  }

  const msgKey = (day: string, role: string) => `${day}__${role}`;
  const msgMap = new Map(messagesPerDayByRole.map((r) => [msgKey(r.day, r.role), r.count]));
  const messagesSeries7 = allDays7.map((day) => ({
    day,
    user: msgMap.get(msgKey(day, "user")) ?? 0,
    assistant: msgMap.get(msgKey(day, "assistant")) ?? 0,
    system: msgMap.get(msgKey(day, "system")) ?? 0,
  }));

  return {
    range: { from30: from30.toISOString(), from7: from7.toISOString(), now: now.toISOString() },
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
    series: { usersSeries30, revenueSeries30, messagesSeries7 },
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
  // Touch Request data here too (extra safe)
  headers();
  noStore();

  const data = await getDashboardData();

  return (
    <div className="p-4 md:p-6">
      <AdminDashboardClient data={data} />
    </div>
  );
}
