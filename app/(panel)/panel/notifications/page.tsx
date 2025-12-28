import { IsAuthenticated } from "@/auth/AuthFunctions";
import TopTitle from "@/components/layout/TopTitle/TopTitle";
import NotificationCard from "@/components/panel/notifications/NotificationCard";
import { prisma } from "@/prisma/prisma";

export default async function Page() {
  const user = await IsAuthenticated();
  if (!user) {
    return (
      <div className='w-full h-full flex items-center justify-center'>
        <p>لطفا وارد حساب کاربری خود شوید</p>
      </div>
    );
  }
  const notifications = await prisma.notification.findMany({
    where: {
      userId: user?.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return (
    <div className='w-full h-full relative flex flex-col items-center justify-center'>
      <TopTitle
        iconName='alarm-clock'
        title='اطلاعیه ها'
        containerClassName='mb-4 w-full -z-10'
      />
      <div className='flex flex-wrap gap-4 p-4 mx-auto md:w-full items-center justify-center w-full'>
        {notifications.map((notif) => (
          <NotificationCard key={notif.id} notification={notif} />
        ))}
      </div>
    </div>
  );
}
