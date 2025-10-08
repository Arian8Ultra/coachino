import { User_GetAll } from "@/prisma/functions/User/UserFun";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Subscription_GetAll } from "@/prisma/functions/Subscription/SubFun";
import { IsAuthenticated } from "@/auth/AuthFunctions";
export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const users = await User_GetAll({
    skip: ((page ? parseInt(page) : 1) - 1) * 10,
  });
  const totalPages = Math.ceil(users.length / 10);
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
  return (
    <div className='p-5 flex flex-col gap-5'>
      <h1 className='text-2xl font-bold'>آزمون‌ها</h1>
      <Table className='bg-glass rounded-lg'>
        <TableHeader>
          <TableRow className='*:text-start *:font-semibold'>
            <TableHead>شناسه</TableHead>
            <TableHead>نام</TableHead>
            <TableHead>شماره</TableHead>
            <TableHead>اشتراک</TableHead>
            <TableHead>...</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.id}</TableCell>
              <TableCell>
                {user.name}
                {user.is_admin && (
                  <span className='text-xs bg-primary/20 text-primary rounded-full px-2 py-0.5 mr-2'>
                    {" "}
                    ادمین{" "}
                  </span>
                )}
                {user.id == currentUser.id && (
                  <span className='text-xs bg-accent/20 text-accent rounded-full px-2 py-0.5 mr-2'>
                    {" "}
                    شما{" "}
                  </span>
                )}
              </TableCell>
              <TableCell>{user.phone}</TableCell>
              <TableCell>
                {user.UserSubscriptions && user.UserSubscriptions.length > 0
                  ? user.UserSubscriptions[0].subscriptionId &&
                    subscriptions.find(
                      (sub) =>
                        sub.id === user.UserSubscriptions[0].subscriptionId,
                    )?.name
                  : "ندارد"}
              </TableCell>
              {/* <TableCell>
                <UserModal user={user} />
              </TableCell> */}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href={`/admin/users?page=${
                page && parseInt(page) > 1 ? parseInt(page) - 1 : 1
              }`}
            />
          </PaginationItem>
          <PaginationItem>
            {/* <PaginationLink href='#'>1</PaginationLink> */}
            {[...Array(totalPages)].map((_, i) => (
              <PaginationLink
                key={i}
                href={`/admin/users?page=${i + 1}`}
                aria-current={page === `${i + 1}` ? "page" : undefined}
                className={
                  page === `${i + 1}`
                    ? "bg-primary text-secondary hover:bg-primary/90"
                    : ""
                }
              >
                {i + 1}
              </PaginationLink>
            ))}
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              href={`/admin/users?page=${
                page && parseInt(page) < totalPages
                  ? parseInt(page) + 1
                  : totalPages
              }`}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
