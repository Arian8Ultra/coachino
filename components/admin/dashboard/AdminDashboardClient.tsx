/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/admin/dashboard/AdminDashboardClient.tsx
"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  Bar,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ComposedChart,
  Line,
  BarChart,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import ExportTransactions from "./ExportTransactions";

export type AdminDashboardData = {
  range: { from30: string; from7: string; from24h: string; now: string };
  kpis: {
    usersTotal: number;
    usersNew30: number;
    chatsTotal: number;
    messagesTotal: number;
    tasksTotal: number;
    feedbackTotal: number;
    notificationsTotal: number;
    notificationsUnread: number;
    transactionsTotal: number;
    transactionsPending: number;
  };
  series: {
    // DAILY
    usersSeriesDaily30: Array<{ bucket: string; users: number }>;
    revenueSeriesDaily30: Array<{
      bucket: string;
      revenue: number;
      completed: number;
      failed: number;
    }>;
    messagesSeriesDaily7: Array<{
      bucket: string;
      user: number;
      assistant: number;
      system: number;
    }>;

    // HOURLY
    usersSeriesHourly24: Array<{ bucket: string; users: number }>;
    revenueSeriesHourly24: Array<{
      bucket: string;
      revenue: number;
      completed: number;
      failed: number;
    }>;
    messagesSeriesHourly24: Array<{
      bucket: string;
      user: number;
      assistant: number;
      system: number;
    }>;
  };
  distributions: {
    taskStatus: Array<{ name: string; value: number }>;
    taskPriority: Array<{ name: string; value: number }>;
    feedbackTypes: Array<{ name: string; value: number }>;
    transactionStatus: Array<{
      name: string;
      value: number;
      amountSum: number;
    }>;
    activeSubsByName: Array<{ name: string; value: number }>;
    topExams: Array<{ name: string; value: number }>;
    notifications: Array<{ name: string; value: number }>;
  };
  recent: {
    transactions: Array<{
      id: string;
      createdAt: string;
      status: string;
      amount: number;
      transactionId: string;
      zibalStatus: string | null;
      user: { id: string; name: string; phone: string };
      subscription: { id: string; name: string };
    }>;
    feedback: Array<{
      id: string;
      createdAt: string;
      type: string;
      message: string;
      answer: string | null;
      user: { id: string; name: string; phone: string };
    }>;
  };
};

function fmtInt(n: number) {
  return new Intl.NumberFormat().format(n);
}
function fmtMoney(n: number) {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(
    n,
  );
}

function KpiCard(props: {
  title: string;
  value: string;
  hint?: string;
  badge?: string;
}) {
  return (
    <Card className='rounded-2xl'>
      <CardHeader className='pb-2'>
        <CardTitle className='text-sm font-medium text-muted-foreground flex items-center justify-between'>
          <span>{props.title}</span>
          {props.badge ? (
            <Badge variant='secondary'>{props.badge}</Badge>
          ) : null}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='text-2xl font-semibold'>{props.value}</div>
        {props.hint ? (
          <div className='text-xs text-muted-foreground mt-1'>{props.hint}</div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function SimpleTable(props: {
  columns: string[];
  rows: Array<Array<React.ReactNode>>;
}) {
  return (
    <div className='w-full overflow-auto rounded-xl border'>
      <table className='w-full text-sm'>
        <thead className='bg-muted/50'>
          <tr>
            {props.columns.map((c) => (
              <th
                key={c}
                className='text-left font-medium p-3 whitespace-nowrap'
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {props.rows.map((r, i) => (
            <tr key={i} className='border-t'>
              {r.map((cell, j) => (
                <td key={j} className='p-3 align-top whitespace-nowrap'>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  const variant =
    s === "completed"
      ? "default"
      : s === "pending"
      ? "secondary"
      : "destructive";
  return <Badge variant={variant as any}>{status}</Badge>;
}

function formatBucketLabel(bucket: string, mode: "daily" | "hourly") {
  // daily: "YYYY-MM-DD"
  // hourly: "YYYY-MM-DD HH:00"
  if (mode === "daily") return bucket;

  // For hourly show "HH:00" (keeps chart readable)
  const hh = bucket.slice(11, 13);
  return `${hh}:00`;
}

export default function AdminDashboardClient({
  data,
}: {
  data: AdminDashboardData;
}) {
  const [mode, setMode] = React.useState<"daily" | "hourly">("daily");

  const usersSeries =
    mode === "daily"
      ? data.series.usersSeriesDaily30
      : data.series.usersSeriesHourly24;
  const revenueSeries =
    mode === "daily"
      ? data.series.revenueSeriesDaily30
      : data.series.revenueSeriesHourly24;
  const messagesSeries =
    mode === "daily"
      ? data.series.messagesSeriesDaily7
      : data.series.messagesSeriesHourly24;

  const totalRevenueDaily30 = React.useMemo(
    () =>
      data.series.revenueSeriesDaily30.reduce(
        (acc, x) => acc + (x.revenue ?? 0),
        0,
      ),
    [data.series.revenueSeriesDaily30],
  );

  const messagesSeriesWithTotal = React.useMemo(() => {
    return messagesSeries.map((x) => ({
      ...x,
      total: (x.user ?? 0) + (x.assistant ?? 0) + (x.system ?? 0),
    }));
  }, [messagesSeries]);

  return (
    <div className='flex flex-col gap-6'>
      {/* Header */}
      <div className='flex flex-col gap-2'>
        <div className='flex items-center justify-between gap-3 flex-wrap'>
          <div className='flex flex-col gap-1'>
            <h1 className='text-2xl md:text-3xl font-semibold'>
              داشبورد ادمین
            </h1>
            <div className='text-sm text-muted-foreground'>
              {mode === "daily"
                ? "حالت روزانه: کاربران/درآمد (۳۰ روز اخیر) و پیام‌ها (۷ روز اخیر)"
                : "حالت ساعتی: ۲۴ ساعت اخیر"}
            </div>
          </div>

          <div className='flex items-center gap-2'>
            <Button
              variant={mode === "daily" ? "default" : "secondary"}
              size='sm'
              onClick={() => setMode("daily")}
            >
              روزانه
            </Button>
            <Button
              variant={mode === "hourly" ? "default" : "secondary"}
              size='sm'
              onClick={() => setMode("hourly")}
            >
              ساعتی
            </Button>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-5'>
        <KpiCard
          title='کل کاربران'
          value={fmtInt(data.kpis.usersTotal)}
          hint={`+${fmtInt(data.kpis.usersNew30)} در ۳۰ روز اخیر`}
        />
        <KpiCard title='کل چت‌ها' value={fmtInt(data.kpis.chatsTotal)} />
        <KpiCard title='کل پیام‌ها' value={fmtInt(data.kpis.messagesTotal)} />
        <KpiCard
          title='نوتیفیکیشن خوانده‌نشده'
          value={fmtInt(data.kpis.notificationsUnread)}
          hint={`${fmtInt(data.kpis.notificationsTotal)} کل`}
        />
        <KpiCard
          title='درآمد (۳۰ روز)'
          value={fmtMoney(totalRevenueDaily30)}
          hint={`${fmtInt(data.kpis.transactionsTotal)} تراکنش`}
          badge={
            data.kpis.transactionsPending > 0
              ? `${data.kpis.transactionsPending} pending`
              : undefined
          }
        />
      </div>

      {/* Big charts row */}
      <div className='grid gap-4 lg:grid-cols-2'>
        <Card className='rounded-2xl'>
          <CardHeader>
            <CardTitle>
              {mode === "daily"
                ? "رشد کاربران (روزانه)"
                : "رشد کاربران (ساعتی)"}{" "}
            </CardTitle>
          </CardHeader>
          <CardContent className='h-80'>
            <ResponsiveContainer width='100%' height='100%'>
              <AreaChart data={usersSeries} margin={{ left: 8, right: 8 }}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis
                  dataKey='bucket'
                  tickMargin={8}
                  tickFormatter={(v) => formatBucketLabel(String(v), mode)}
                  minTickGap={12}
                />
                <YAxis tickMargin={8} />
                <Tooltip labelFormatter={(v) => String(v)} />
                <Legend />
                <Area type='monotone' dataKey='users' name='Users' />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className='rounded-2xl'>
          <CardHeader>
            <CardTitle>
              {mode === "daily" ? "درآمد (روزانه)" : "درآمد (ساعتی)"}
            </CardTitle>
          </CardHeader>
          <CardContent className='h-80'>
            <ResponsiveContainer width='100%' height='100%'>
              <AreaChart data={revenueSeries} margin={{ left: 8, right: 8 }}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis
                  dataKey='bucket'
                  tickMargin={8}
                  tickFormatter={(v) => formatBucketLabel(String(v), mode)}
                  minTickGap={12}
                />
                <YAxis tickMargin={8} />
                <Tooltip labelFormatter={(v) => String(v)} />
                <Legend />
                <Area
                  type='monotone'
                  dataKey='revenue'
                  name='Revenue (completed)'
                />
                <Area
                  type='monotone'
                  dataKey='completed'
                  name='Completed count'
                />
                <Area type='monotone' dataKey='failed' name='Failed count' />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Messages */}
      <Card className='rounded-2xl'>
        <CardHeader>
          <CardTitle>
            {mode === "daily"
              ? "پیام‌ها بر اساس نقش (۷ روز اخیر)"
              : "پیام‌ها بر اساس نقش (۲۴ ساعت اخیر)"}
          </CardTitle>
        </CardHeader>

        <CardContent className='h-80'>
          <ResponsiveContainer width='100%' height='100%'>
            <ComposedChart
              data={messagesSeriesWithTotal}
              margin={{ left: 8, right: 8 }}
            >
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis
                dataKey='bucket'
                tickMargin={8}
                tickFormatter={(v) => formatBucketLabel(String(v), mode)}
                minTickGap={12}
              />
              <YAxis tickMargin={8} />
              <Tooltip labelFormatter={(v) => String(v)} />
              <Legend />

              {/* Bars */}
              <Bar dataKey='user' name='User' fill='#3b82f6' />
              <Bar dataKey='assistant' name='Assistant' fill='#10b981' />
              <Bar dataKey='system' name='System' fill='#f59e0b' />

              {/* Line overlay (Total) */}
              <Line
                type='monotone'
                dataKey='total'
                name='Total'
                stroke='#2196F3'
                strokeWidth={2}
                dot={true}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Distributions (unchanged from your version) */}
      <div className='grid gap-4 lg:grid-cols-3'>
        <Card className='rounded-2xl'>
          <CardHeader>
            <CardTitle>Task status</CardTitle>
          </CardHeader>
          <CardContent className='h-[280px]'>
            <ResponsiveContainer width='100%' height='100%'>
              <PieChart>
                <Tooltip />
                <Legend />
                <Pie
                  data={data.distributions.taskStatus}
                  dataKey='value'
                  nameKey='name'
                  outerRadius={90}
                  stroke='none'
                >
                  <Cell key='open' fill='#3b82f6' />
                  <Cell key='in-progress' fill='#fbbf24' />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className='rounded-2xl'>
          <CardHeader>
            <CardTitle>Active subscriptions</CardTitle>
          </CardHeader>
          <CardContent className='h-[280px]'>
            <ResponsiveContainer width='100%' height='100%'>
              <PieChart>
                <Tooltip />
                <Legend />
                <Pie
                  data={data.distributions.activeSubsByName}
                  dataKey='value'
                  nameKey='name'
                  outerRadius={90}
                  stroke='none'
                >
                  {data.distributions.activeSubsByName.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={`hsl(${
                        (index / data.distributions.activeSubsByName.length) *
                        360
                      }, 70%, 50%)`}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className='rounded-2xl'>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent className='h-[280px]'>
            <ResponsiveContainer width='100%' height='100%'>
              <PieChart>
                <Tooltip />
                <Legend />
                <Pie
                  data={data.distributions.notifications}
                  dataKey='value'
                  nameKey='name'
                  outerRadius={90}
                  stroke='none'
                >
                  <Cell key='unread' fill='#f87171' />
                  <Cell key='read' fill='#34d399' />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className='grid gap-4 lg:grid-cols-2'>
        <Card className='rounded-2xl'>
          <CardHeader className='flex justify-between items-center gap-5'>
            <CardTitle>Transactions status</CardTitle>
            <ExportTransactions />
          </CardHeader>
          <CardContent className='h-80'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart
                data={data.distributions.transactionStatus}
                margin={{ left: 8, right: 8 }}
              >
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='name' tickMargin={8} />
                <YAxis tickMargin={8} />
                <Tooltip />
                <Legend />
                <Bar dataKey='value' name='Count' fill='#3b82f6' />
                <Bar dataKey='amountSum' name='Amount sum' fill='#10b981' />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className='rounded-2xl'>
          <CardHeader>
            <CardTitle>Top exams (last 30 days)</CardTitle>
          </CardHeader>
          <CardContent className='h-80'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart
                data={data.distributions.topExams}
                margin={{ left: 8, right: 8 }}
              >
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='name' tickMargin={8} />
                <YAxis tickMargin={8} />
                <Tooltip />
                <Legend />
                <Bar dataKey='value' name='Attempts' fill='#3b82f6' />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Recent tables */}
      <div className='grid gap-4 lg:grid-cols-2'>
        <Card className='rounded-2xl'>
          <CardHeader className='flex justify-between items-center gap-5'>
            <CardTitle>Recent transactions</CardTitle>
            <ExportTransactions />
          </CardHeader>
          <CardContent className='space-y-3'>
            <SimpleTable
              columns={[
                "Time",
                "User",
                "Subscription",
                "Amount",
                "Status",
                "TransactionId",
              ]}
              rows={data.recent.transactions.map((t) => [
                new Date(t.createdAt).toLocaleString(),
                <div className='flex flex-col' key={t.id}>
                  <span className='font-medium'>{t.user.name}</span>
                  <span className='text-xs text-muted-foreground'>
                    {t.user.phone}
                  </span>
                </div>,
                t.subscription.name,
                fmtMoney(t.amount),
                <StatusBadge status={t.status} key={`${t.id}-status`} />,
                <span className='font-mono text-xs' key={`${t.id}-txid`}>
                  {t.transactionId}
                </span>,
              ])}
            />
          </CardContent>
        </Card>

        <Card className='rounded-2xl'>
          <CardHeader>
            <CardTitle>Recent feedback</CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            <SimpleTable
              columns={["Time", "User", "Type", "Message", "Answered"]}
              rows={data.recent.feedback.map((f) => [
                new Date(f.createdAt).toLocaleString(),
                <div className='flex flex-col' key={f.id}>
                  <span className='font-medium'>{f.user.name}</span>
                  <span className='text-xs text-muted-foreground'>
                    {f.user.phone}
                  </span>
                </div>,
                <Badge variant='outline' key={`${f.id}-type`}>
                  {f.type}
                </Badge>,
                <span
                  className='max-w-[420px] inline-block truncate align-top'
                  key={`${f.id}-msg`}
                >
                  {f.message}
                </span>,
                f.answer ? (
                  <Badge key={`${f.id}-ans`}>Yes</Badge>
                ) : (
                  <Badge variant='secondary' key={`${f.id}-no`}>
                    No
                  </Badge>
                ),
              ])}
            />
          </CardContent>
        </Card>
      </div>

      <div className='grid gap-4 lg:grid-cols-2'>
        <Card className='rounded-2xl'>
          <CardHeader>
            <CardTitle>Task priority</CardTitle>
          </CardHeader>
          <CardContent className='h-[280px]'>
            <ResponsiveContainer width='100%' height='100%'>
              <PieChart>
                <Tooltip />
                <Legend />
                <Pie
                  data={data.distributions.taskPriority}
                  dataKey='value'
                  nameKey='name'
                  outerRadius={90}
                >
                  <Cell key='high' fill='#f87171' />
                  <Cell key='medium' fill='#fbbf24' />
                  <Cell key='low' fill='#34d399' />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className='rounded-2xl'>
          <CardHeader>
            <CardTitle>Feedback types</CardTitle>
          </CardHeader>
          <CardContent className='h-[280px]'>
            <ResponsiveContainer width='100%' height='100%'>
              <PieChart>
                <Tooltip />
                <Legend />
                <Pie
                  data={data.distributions.feedbackTypes}
                  dataKey='value'
                  nameKey='name'
                  outerRadius={90}
                >
                  <Cell key='bug' fill='#f87171' />
                  <Cell key='feature' fill='#60a5fa' />
                  <Cell key='other' fill='#34d399' />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
