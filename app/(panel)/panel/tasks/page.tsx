import { GetUserId } from "@/auth/AuthFunctions";
import TopTitle from "@/components/layout/TopTitle/TopTitle";
import MiniTaskCard from "@/components/panel/task/MiniTaskCard";
import { Tast_GetUserTasks } from "@/prisma/functions/Tasks/TasksFun";
import { cookies } from "next/headers";

export default async function Page() {
  const cookie = await cookies();
  const token = cookie.get("token")?.value;
  if (!token) {
    return (
      <div className='flex flex-col gap-3'>
        <TopTitle
          title={"تسک ها"}
          iconName='list-todo'
          h1='تسک ها'
          className='mb-4'
        />
        <p className='text-red-500'>برای مشاهده تسک ها وارد شوید.</p>
      </div>
    );
  }

  const userId = token ? GetUserId(token) : null;
  if (!userId) {
    return (
      <div className='flex flex-col gap-3'>
        <TopTitle
          title={"تسک ها"}
          iconName='list-todo'
          h1='دسترسی غیرمجاز'
          className='mb-4'
        />
        <p className='text-red-500'>شما به این بخش دسترسی ندارید.</p>
      </div>
    );
  }
  const tasks = await Tast_GetUserTasks(userId);
  if (!tasks || tasks.length === 0) {
    return (
      <div className='flex flex-col gap-3'>
        <TopTitle
          title={"تسک ها"}
          iconName='list-todo'
          h1='تسک ها'
          className='mb-4'
        />
        <p className='text-gray-500'>شما هیچ تسکی ندارید.</p>
      </div>
    );
  }
  // check if tasks belong to the user
  const userTasks = tasks.filter((task) => task.userId === userId);
  if (userTasks.length === 0) {
    return (
      <div className='flex flex-col gap-3'>
        <TopTitle
          title={"تسک ها"}
          iconName='list-todo'
          h1='دسترسی غیرمجاز'
          className='mb-4'
        />
        <p className='text-red-500'>شما به این تسک ها دسترسی ندارید.</p>
      </div>
    );
  }
  return (
    <div className='flex flex-col gap-3'>
      <TopTitle
        title={"تسک ها"}
        iconName='list-todo'
        h1='تسک ها'
        className='mb-4'
      />
      <div className='flex flex-wrap gap-4'>
        {userTasks?.sort((a, b) => {
            return (
              (a.dueDate &&
                b.dueDate &&
                new Date(a.dueDate).getTime() -
                  new Date(b.dueDate).getTime()) ||
              0
            );
          }).map((task) => (
          <MiniTaskCard task={task} key={task.id} className='w-full' />
        ))}
      </div>
    </div>
  );
}
