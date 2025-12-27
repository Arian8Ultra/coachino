import AdminPagination from "@/components/admin/General/AdminPagination";
import AdminTable from "@/components/admin/General/AdminTable";
import { AdminTableColumn } from "@/components/admin/General/AdminTableRow";
import { prisma } from "@/prisma/prisma";

export default async function FeedBacksPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const currentPage = page ? parseInt(page) : 1;

  const totalCount = await prisma.feedback.count();
  const totalPages = Math.ceil(totalCount / 10);

  const feedbacks = await prisma.feedback.findMany({
    orderBy: {
      createdAt: "desc",
    },
    skip: (currentPage - 1) * 10,
    take: 10,
  });

  //   const columns: Array<AdminTableColumn<(typeof employees)[number]>> = [
  //   { header: "Name", cell: (row) => row.name },
  //   { header: "Email", cell: (row) => row.email ?? "-" },
  //   { header: "Phone", cell: (row) => row.phone ?? "-" },
  //   { header: "Position", cell: (row) => row.position ?? "-" },
  //   {
  //     header: "Deactivated",
  //     cell: (row) => (row.is_deactivated ? "Yes" : "No"),
  //   },
  //   {
  //     header: "Created At",
  //     cell: (row) =>
  //       row.createdAt.toLocaleString("fa-IR", {
  //         dateStyle: "short",
  //       }),
  //   },
  //   {
  //     header: "...",
  //     cell: (row) => <DeleteEmployeeButton id={row.id} />,
  //   },
  // ];

  const columns: Array<AdminTableColumn<(typeof feedbacks)[number]>> = [
    { header: "ID", cell: (row) => row.id },
    { header: "User ID", cell: (row) => row.userId },
    { header: "Type", cell: (row) => row.type },
    { header: "Message", cell: (row) => row.message },
    { header: "URL", cell: (row) => row.url || "-" },
    { header: "Answer", cell: (row) => row.answer || "-" },
    {
      header: "Created At",
      cell: (row) =>
        row.createdAt.toLocaleString("fa-IR", {
          dateStyle: "short",
        }),
    },
  ];

  return (
    <div className='flex flex-col gap-5 p-2 overflow-auto'>
      <div className='flex justify-between items-center'>
        <h1>Feedbacks</h1>
      </div>

      <AdminTable
        tableClassName='rounded-lg overflow-hidden'
        columns={columns}
        data={feedbacks}
        getRowKey={(row) => row.id}
      />

      <AdminPagination
        basePath='/admin/feedbacks'
        page={currentPage}
        totalPages={totalPages}
      />
    </div>
  );
}
