import { IsAuthenticated } from "@/auth/AuthFunctions";
import AdminDeleteButton from "@/components/admin/General/AdminDeleteButton";
import AdminPagination from "@/components/admin/General/AdminPagination";
import AdminTable from "@/components/admin/General/AdminTable";
import { AdminTableColumn } from "@/components/admin/General/AdminTableRow";
import AddDiscountCodeModal from "@/components/admin/discount/AddDiscountCodeModal";
import { prisma } from "@/prisma/prisma";

const PAGE_SIZE = 10;

export default async function AdminDiscountPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const currentUser = await IsAuthenticated();
  if (!currentUser || !currentUser.is_admin) {
    return (
      <div className='p-5'>
        <h1 className='text-2xl font-bold'>دسترسی غیرمجاز</h1>
        <p>شما دسترسی لازم برای مشاهده این صفحه را ندارید.</p>
      </div>
    );
  }

  const { page } = await searchParams;
  const currentPage = page ? parseInt(page) : 1;

  const totalCount = await prisma.discountCode.count();
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const discountCodes = await prisma.discountCode.findMany({
    skip: (Math.max(currentPage, 1) - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    orderBy: { createdAt: "desc" },
  });

  const columns: Array<AdminTableColumn<(typeof discountCodes)[number]>> = [
    { header: "کد", cell: (row) => row.code },
    { header: "توضیحات", cell: (row) => row.description || "-" },
    { header: "درصد تخفیف", cell: (row) => `${row.discountPct}%` },
    {
      header: "از",
      cell: (row) =>
        row.validFrom.toLocaleString("fa-IR", {
          dateStyle: "short",
          timeStyle: "short",
        }),
    },
    {
      header: "تا",
      cell: (row) =>
        row.validTo.toLocaleString("fa-IR", {
          dateStyle: "short",
          timeStyle: "short",
        }),
    },
    { header: "تعداد استفاده", cell: (row) => row.numberOfUses },
    {
      header: "سقف استفاده",
      cell: (row) => (row.limitUses == null ? "نامحدود" : row.limitUses),
    },
    { header: "وضعیت", cell: (row) => (row.isActive ? "فعال" : "غیرفعال") },
    {
      header: "...",
      cell: (row) => (
        <AdminDeleteButton
          id={row.id}
          typeName='discountcode'
          confirm={true}
          confirmText='آیا از حذف این کد تخفیف اطمینان دارید؟ این عملیات غیرقابل بازگشت است.'
        />
      ),
    },
  ];

  return (
    <div className='p-5 flex flex-col gap-5'>
      <div className='flex justify-between w-full items-center'>
        <h1 className='text-2xl font-bold'>کدهای تخفیف</h1>
        <AddDiscountCodeModal />
      </div>
      <AdminTable
        tableClassName='rounded-lg overflow-hidden'
        columns={columns}
        data={discountCodes}
        getRowKey={(row) => row.id}
        emptyText='کد تخفیفی یافت نشد.'
      />
      <AdminPagination
        basePath='/admin/discount'
        page={currentPage}
        totalPages={totalPages}
      />
    </div>
  );
}