/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/admin/dashboard/AdminDashboardClient.tsx
"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export type AdminDashboardData = {
  range: { from30: string; from7: string; now: string };
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
    usersSeries30: Array<{ day: string; users: number }>;
    revenueSeries30: Array<{
      day: string;
      revenue: number;
      completed: number;
      failed: number;
    }>;
    messagesSeries7: Array<{
      day: string;
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

export default function AdminDashboardClient({
  data,
}: {
  data: AdminDashboardData;
}) {
  const totalRevenue30 = React.useMemo(
    () =>
      data.series.revenueSeries30.reduce((acc, x) => acc + (x.revenue ?? 0), 0),
    [data.series.revenueSeries30],
  );

  return (
    <div className='flex flex-col gap-6'>
      {/* Header */}
      <div className='flex flex-col gap-1'>
        <h1 className='text-2xl md:text-3xl font-semibold'>Admin Dashboard</h1>
        <div className='text-sm text-muted-foreground'>
          Window: last 30 days (KPIs/Revenue/Users) and last 7 days (Messages)
        </div>
      </div>

      {/* KPIs */}
      <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-5'>
        <KpiCard
          title='Total Users'
          value={fmtInt(data.kpis.usersTotal)}
          hint={`+${fmtInt(data.kpis.usersNew30)} in last 30 days`}
        />
        <KpiCard title='Total Chats' value={fmtInt(data.kpis.chatsTotal)} />
        <KpiCard
          title='Total Messages'
          value={fmtInt(data.kpis.messagesTotal)}
        />
        <KpiCard
          title='Unread Notifications'
          value={fmtInt(data.kpis.notificationsUnread)}
          hint={`${fmtInt(data.kpis.notificationsTotal)} total`}
        />
        <KpiCard
          title='Revenue (30d)'
          value={fmtMoney(totalRevenue30)}
          hint={`${fmtInt(data.kpis.transactionsTotal)} transactions`}
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
            <CardTitle>Users growth (30 days)</CardTitle>
          </CardHeader>
          <CardContent className='h-80'>
            <ResponsiveContainer width='100%' height='100%'>
              <AreaChart
                data={data.series.usersSeries30}
                margin={{ left: 8, right: 8 }}
              >
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='day' tickMargin={8} />
                <YAxis tickMargin={8} />
                <Tooltip />
                <Legend />
                <Area type='monotone' dataKey='users' name='New users' />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className='rounded-2xl'>
          <CardHeader>
            <CardTitle>Revenue (30 days)</CardTitle>
          </CardHeader>
          <CardContent className='h-80'>
            <ResponsiveContainer width='100%' height='100%'>
              <AreaChart
                data={data.series.revenueSeries30}
                margin={{ left: 8, right: 8 }}
              >
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='day' tickMargin={8} />
                <YAxis tickMargin={8} />
                <Tooltip />
                <Legend />
                <Area
                  type='monotone'
                  dataKey='revenue'
                  name='Revenue (completed)'
                />
                <Area
                  type='monotone'
                  dataKey='completed'
                  name='Completed tx count'
                />
                <Area type='monotone' dataKey='failed' name='Failed tx count' />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Messages 7 days */}
      <Card className='rounded-2xl'>
        <CardHeader>
          <CardTitle>Messages volume by role (7 days)</CardTitle>
        </CardHeader>
        <CardContent className='h-80'>
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart
              data={data.series.messagesSeries7}
              margin={{ left: 8, right: 8 }}
            >
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='day' tickMargin={8} />
              <YAxis tickMargin={8} />
              <Tooltip />
              <Legend />
              <Bar dataKey='user' name='User' fill="#3b82f6" />
              <Bar dataKey='assistant' name='Assistant' fill="#10b981" />
              <Bar dataKey='system' name='System' fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Distributions */}
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
                  stroke="none"
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
                  stroke="none"
                >
                    {data.distributions.activeSubsByName.map((entry, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={`hsl(${(index / data.distributions.activeSubsByName.length) * 360}, 70%, 50%)`}
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
                  stroke="none"
                >
                    <Cell key='unread' fill='#f87171' />
                    <Cell key='read' fill='#34d399' />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* More distributions */}
      <div className='grid gap-4 lg:grid-cols-2'>
        <Card className='rounded-2xl'>
          <CardHeader>
            <CardTitle>Transactions status</CardTitle>
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
                <Bar dataKey='value' name='Count' fill="#3b82f6" />
                <Bar dataKey='amountSum' name='Amount sum' fill="#10b981" />
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
                <Bar dataKey='value' name='Attempts' fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Recent tables */}
      <div className='grid gap-4 lg:grid-cols-2'>
        <Card className='rounded-2xl'>
          <CardHeader>
            <CardTitle>Recent transactions</CardTitle>
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
                <StatusBadge status={t.status} key={t.id} />,
                <span className='font-mono text-xs' key={t.id}>
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
                <Badge variant='outline' key={f.id}>
                  {f.type}
                </Badge>,
                <span
                  className='max-w-[420px] inline-block truncate align-top'
                  key={f.id}
                >
                  {f.message}
                </span>,
                f.answer ? (
                  <Badge>Yes</Badge>
                ) : (
                  <Badge variant='secondary'>No</Badge>
                ),
              ])}
            />
          </CardContent>
        </Card>
      </div>

      {/* Small extra slice: priorities & feedback types */}
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
