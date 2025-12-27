import { IsAuthenticated } from "@/auth/AuthFunctions";
import AdminPagination from "@/components/admin/General/AdminPagination";
import AdminTable from "@/components/admin/General/AdminTable";
import { AdminTableColumn } from "@/components/admin/General/AdminTableRow";
import { Subscription_GetAll } from "@/prisma/functions/Subscription/SubFun";
import { User_GetAll } from "@/prisma/functions/User/UserFun";
import { prisma } from "@/prisma/prisma";
export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const currentPage = page ? parseInt(page) : 1;

  const totalCount = await prisma.user.count();
  const totalPages = Math.ceil(totalCount / 10);

  const users = await User_GetAll({
    skip: ((page ? parseInt(page) : 1) - 1) * 10,
    take: 10,
  });
  const subscriptions = await Subscription_GetAll();
  const currentUser = await IsAuthenticated();
  if (!currentUser || !currentUser.is_admin) {
    return (
      <div className='p-5'>
        <h1 className='text-2xl font-bold'>دسترسی غیرمجاز</h1>
        <p>شما دسترسی لازم برای مشاهده این صفحه را ندارید.</p>
      </div>
    );
  }

  // const columns: Array<AdminTableColumn<(typeof feedbacks)[number]>> = [
  //   { header: "ID", cell: (row) => row.id },
  //   { header: "User ID", cell: (row) => row.userId },
  //   { header: "Type", cell: (row) => row.type },
  //   { header: "Message", cell: (row) => row.message },
  //   { header: "URL", cell: (row) => row.url || "-" },
  //   { header: "Answer", cell: (row) => row.answer || "-" },
  //   {
  //     header: "Created At",
  //     cell: (row) =>
  //       row.createdAt.toLocaleString("fa-IR", {
  //         dateStyle: "short",
  //       }),
  //   },
  // ];

  const columns: Array<AdminTableColumn<(typeof users)[number]>> = [
    { header: "ID", cell: (row) => row.id },
    { header: "نام", cell: (row) => row.name || "-" },
    { header: "شماره تلفن", cell: (row) => row.phone || "-" },
    { header: "ایمیل", cell: (row) => row.email || "-" },
    { header: "کد ارجاع", cell: (row) => row.referral_code || "-" },
    {
      header: "ادمین",
      cell: (row) => (row.is_admin ? "بله" : "خیر"),
    },
    {
      header: "غیرفعال شده",
      cell: (row) => (row.is_deactivated ? "بله" : "خیر"),
    },
    {
      header: "اشتراک",
      cell: (row) =>
        subscriptions.find(
          (sub) => sub.id === row.UserSubscriptions?.[0]?.subscriptionId,
        )?.name || "-",
    },
    {
      header: "ایجاد شده در",
      cell: (row) =>
        row.createdAt.toLocaleString("fa-IR", { dateStyle: "short" }),
    },
  ];

  return (
    <div className='p-5 flex flex-col gap-5'>
      <h1 className='text-2xl font-bold'>کاربران</h1>
      <AdminTable
        tableClassName='rounded-lg overflow-hidden'
        columns={columns}
        data={users}
        getRowKey={(row) => row.id}
      />
      <AdminPagination
        basePath='/admin/users'
        page={currentPage}
        totalPages={totalPages}
      />
    </div>
  );
}
