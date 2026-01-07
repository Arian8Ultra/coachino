import { IsAuthenticated } from "@/auth/AuthFunctions";
import AdminTable from "@/components/admin/General/AdminTable";
import { AdminTableColumn } from "@/components/admin/General/AdminTableRow";
import { prisma } from "@/prisma/prisma";

export default async function UserTransactionsPage() {
  const user = await IsAuthenticated();
  if (!user) {
    return (
      <div className='flex flex-col gap-3'>
        <h1 className='text-red-500'>برای مشاهده تراکنش ها وارد شوید.</h1>
      </div>
    );
  }
  const transactions = await prisma.transaction.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  const subscriptions = await prisma.subscription.findMany();
  const columns: Array<AdminTableColumn<(typeof transactions)[number]>> = [
    { header: "شناسه تراکنش", cell: (row) => row.id },
    {
      header: "نام اشتراک",
      cell: (row) => {
        const sub = subscriptions.find((s) => s.id === row.subscriptionId);
        return sub ? sub.name : "اشتراک یافت نشد";
      },
    },
    {
      header: "مبلغ",
      cell: (row) => `${row.amount?.toLocaleString("fa-IR")} ریال`,
    },
    {
      header: "وضعیت",
      cell: (row) => (row.status == "VERIFIED" ? "تایید شده" : row.status == "FAILED" ? "ناموفق" : "در انتظار"),
    },
    {
      header: "تاریخ ایجاد",
      cell: (row) =>
        row.createdAt.toLocaleString("fa-IR", {
          dateStyle: "short",
          timeStyle: "short",
        }),
    },
  ];

  return (
    <div className='flex flex-col gap-3'>
      {transactions.length === 0 ? (
        <h1 className='text-gray-500'>تراکنشی یافت نشد.</h1>
      ) : (
        <AdminTable
          tableClassName='rounded-lg overflow-hidden'
          columns={columns}
          data={transactions}
          getRowKey={(row) => row.id}
        />
      )}
    </div>
  );
}
