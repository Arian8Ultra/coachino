import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Subscription_GetAll } from "@/prisma/functions/Subscription/SubFun";
import { IsAuthenticated } from "@/auth/AuthFunctions";
import AddSubModal from "@/components/admin/subscriptions/AddSubModal";
import { User_GetAll } from "@/prisma/functions/User/UserFun";
import AssignSubModal from "@/components/admin/subscriptions/AssignSubModal";
import EditSubModal from "@/components/admin/subscriptions/EditSubModal";

export default async function AdminSubsPagePage() {
  const currentUser = await IsAuthenticated();
  const users = await User_GetAll({
    take: 100000,
  });
  const subscriptions = await Subscription_GetAll();
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
      <h1 className='text-2xl font-bold'>اشتراک‌ها</h1>
      <AddSubModal />
      <Table className='bg-glass rounded-lg'>
        <TableHeader>
          <TableRow className='*:text-start *:font-semibold'>
            <TableHead>نام</TableHead>
            <TableHead>سطح</TableHead>
            <TableHead>گزینه‌ها</TableHead>
            <TableHead>قیمت</TableHead>
            <TableHead>مدت زمان (روز)</TableHead>
            <TableHead>...</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscriptions.map((sub) => (
            <TableRow key={sub.id}>
              <TableCell>{sub.name}</TableCell>
              <TableCell>{sub.level}</TableCell>
              <TableCell>{sub.options}</TableCell>
              <TableCell>{sub.price}</TableCell>
              <TableCell>{sub.duration}</TableCell>
              <TableCell>
                <div className='flex gap-2 items-center'>
                  <AssignSubModal users={users} subscription={sub} />
                  <EditSubModal subscription={sub} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
